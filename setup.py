#!/usr/bin/env python3
import os
import sys
import urllib.request
import zipfile
import shutil
import subprocess
import platform
import time

def print_step(message):
    """Print a step message with formatting."""
    print("\n" + "="*80)
    print(f"  {message}")
    print("="*80)

def download_file(url, output_file):
    """Download a file from the provided URL."""
    print_step(f"Downloading file from {url}")
    
    try:
        urllib.request.urlretrieve(url, output_file, reporthook=download_progress)
        print(f"\nDownload complete: {output_file}")
        return True
    except Exception as e:
        print(f"Error downloading file: {str(e)}")
        return False

def download_progress(block_num, block_size, total_size):
    """Show progress during download."""
    downloaded = block_num * block_size
    percent = min(100, int(downloaded * 100 / total_size))
    sys.stdout.write(f"\rDownloading: {percent}% [{downloaded} / {total_size}] bytes")
    sys.stdout.flush()

def extract_zip(zip_path, extract_to):
    """Extract a zip file to the specified directory."""
    print_step(f"Extracting {zip_path} to {extract_to}")
    
    try:
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(extract_to)
        print(f"Extraction complete: {extract_to}")
        return True
    except Exception as e:
        print(f"Error extracting zip file: {str(e)}")
        return False

def check_project_type(project_dir):
    """Determine the project type based on the files present."""
    if os.path.exists(os.path.join(project_dir, 'package.json')):
        return 'node'
    elif os.path.exists(os.path.join(project_dir, 'requirements.txt')):
        return 'python'
    elif os.path.exists(os.path.join(project_dir, 'composer.json')):
        return 'php'
    elif any(f.endswith('.csproj') for f in os.listdir(project_dir) if os.path.isfile(os.path.join(project_dir, f))):
        return 'dotnet'
    else:
        # Look at subdirectories if not found at root
        for subdir in [d for d in os.listdir(project_dir) if os.path.isdir(os.path.join(project_dir, d))]:
            subdir_path = os.path.join(project_dir, subdir)
            if os.path.exists(os.path.join(subdir_path, 'package.json')):
                return 'node'
            elif os.path.exists(os.path.join(subdir_path, 'requirements.txt')):
                return 'python'
            elif os.path.exists(os.path.join(subdir_path, 'composer.json')):
                return 'php'
            elif any(f.endswith('.csproj') for f in os.listdir(subdir_path) if os.path.isfile(os.path.join(subdir_path, f))):
                return 'dotnet'
    
    # If we can't determine, look for common file extensions
    exts = []
    for root, _, files in os.walk(project_dir):
        for file in files:
            _, ext = os.path.splitext(file)
            if ext:
                exts.append(ext.lower())
    
    if '.js' in exts or '.jsx' in exts or '.ts' in exts or '.tsx' in exts:
        return 'node'
    elif '.py' in exts:
        return 'python'
    elif '.php' in exts:
        return 'php'
    elif '.cs' in exts:
        return 'dotnet'
    
    return 'unknown'

def install_dependencies(project_dir, project_type):
    """Install project dependencies based on the project type."""
    print_step(f"Installing dependencies for {project_type} project")
    
    try:
        if project_type == 'node':
            # Find the folder containing package.json
            package_json_dir = find_file_dir(project_dir, 'package.json')
            if package_json_dir:
                print(f"Found package.json in {package_json_dir}")
                os.chdir(package_json_dir)
                
                # Check for yarn.lock vs package-lock.json
                if os.path.exists('yarn.lock'):
                    subprocess.run(['yarn', 'install'], check=True)
                else:
                    subprocess.run(['npm', 'install'], check=True)
                return True
            else:
                print("Could not find package.json file")
                return False
                
        elif project_type == 'python':
            # Find the folder containing requirements.txt
            requirements_dir = find_file_dir(project_dir, 'requirements.txt')
            if requirements_dir:
                print(f"Found requirements.txt in {requirements_dir}")
                os.chdir(requirements_dir)
                
                # Check if we're in a virtual environment, create one if not
                if not os.environ.get('VIRTUAL_ENV'):
                    print("Creating virtual environment...")
                    subprocess.run([sys.executable, '-m', 'venv', 'venv'], check=True)
                    
                    # Activate virtual environment
                    if platform.system() == 'Windows':
                        venv_activate = os.path.join('venv', 'Scripts', 'activate.bat')
                        subprocess.run([venv_activate], shell=True, check=True)
                    else:
                        venv_activate = os.path.join('venv', 'bin', 'activate')
                        os.environ['PATH'] = os.path.join(os.getcwd(), 'venv', 'bin') + os.pathsep + os.environ['PATH']
                
                # Install dependencies
                subprocess.run([sys.executable, '-m', 'pip', 'install', '-r', 'requirements.txt'], check=True)
                return True
            else:
                print("Could not find requirements.txt file")
                return False
                
        elif project_type == 'php':
            # Find the folder containing composer.json
            composer_dir = find_file_dir(project_dir, 'composer.json')
            if composer_dir:
                print(f"Found composer.json in {composer_dir}")
                os.chdir(composer_dir)
                subprocess.run(['composer', 'install'], check=True)
                return True
            else:
                print("Could not find composer.json file")
                return False
                
        elif project_type == 'dotnet':
            # Find the folder containing .csproj file
            csproj_dir = None
            for root, _, files in os.walk(project_dir):
                for file in files:
                    if file.endswith('.csproj'):
                        csproj_dir = root
                        break
                if csproj_dir:
                    break
                    
            if csproj_dir:
                print(f"Found .csproj in {csproj_dir}")
                os.chdir(csproj_dir)
                subprocess.run(['dotnet', 'restore'], check=True)
                return True
            else:
                print("Could not find .csproj file")
                return False
                
        else:
            print(f"Unsupported project type: {project_type}")
            return False
            
    except subprocess.CalledProcessError as e:
        print(f"Error installing dependencies: {str(e)}")
        return False
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        return False

def find_file_dir(start_dir, file_name):
    """Find the directory containing the specified file."""
    for root, _, files in os.walk(start_dir):
        if file_name in files:
            return root
    return None

def find_start_script(project_dir, project_type):
    """Find the script to start the application."""
    if project_type == 'node':
        package_json_dir = find_file_dir(project_dir, 'package.json')
        if package_json_dir:
            os.chdir(package_json_dir)
            return ['npm', 'start'], package_json_dir
    
    elif project_type == 'python':
        # Look for common Python entry points
        for entry_file in ['app.py', 'main.py', 'server.py', 'manage.py', 'run.py']:
            entry_dir = find_file_dir(project_dir, entry_file)
            if entry_dir:
                return [sys.executable, os.path.join(entry_dir, entry_file)], entry_dir
                
        # Look for Django management command
        manage_py_dir = find_file_dir(project_dir, 'manage.py')
        if manage_py_dir:
            return [sys.executable, 'manage.py', 'runserver', '0.0.0.0:8000'], manage_py_dir
    
    elif project_type == 'php':
        # Look for Laravel or Symfony apps
        artisan_dir = find_file_dir(project_dir, 'artisan')
        if artisan_dir:
            return ['php', 'artisan', 'serve', '--host=0.0.0.0', '--port=8000'], artisan_dir
            
        # For basic PHP apps, use built-in server
        index_dir = find_file_dir(project_dir, 'index.php')
        if index_dir:
            return ['php', '-S', '0.0.0.0:8000', '-t', index_dir], index_dir
    
    elif project_type == 'dotnet':
        # Find any .csproj file
        csproj_dir = None
        for root, _, files in os.walk(project_dir):
            for file in files:
                if file.endswith('.csproj'):
                    csproj_dir = root
                    break
            if csproj_dir:
                break
                
        if csproj_dir:
            return ['dotnet', 'run', '--urls', 'http://0.0.0.0:8000'], csproj_dir
    
    return None, None

def run_application(project_dir, project_type):
    """Run the application locally."""
    print_step("Starting the application")
    
    start_command, start_dir = find_start_script(project_dir, project_type)
    
    if start_command:
        try:
            print(f"Running command: {' '.join(start_command)} in directory: {start_dir}")
            os.chdir(start_dir)
            
            # Start the application process
            process = subprocess.Popen(start_command)
            
            print(f"\nApplication is running with PID {process.pid}")
            print(f"Application should be available at:")
            
            if project_type == 'node':
                print("- Frontend: http://localhost:5000")
            else:
                print("- Backend: http://localhost:8000")
                
            print("\nPress Ctrl+C to stop the application")
            
            # Keep the application running until user interrupts
            try:
                process.wait()
            except KeyboardInterrupt:
                print("\nStopping the application...")
                process.terminate()
                
            return True
        except Exception as e:
            print(f"Error starting the application: {str(e)}")
            return False
    else:
        print("Could not determine how to start the application.")
        print("You may need to check the project documentation for instructions.")
        return False

def main():
    """Main function to download, extract and set up the project."""
    # Configuration
    download_url = "https://www.dropbox.com/scl/fi/52nx544ydfpk6sio8b82d/UtahRealEstatePrep-1-2.zip?rlkey=fbfw214je7oezwbbmzahzklaa&st=ar5z5nck&dl=1"  # Using dl=1 to force download
    zip_file = "UtahRealEstatePrep-1-2.zip"
    extract_dir = "utah_real_estate_project"
    
    # Create extract directory if it doesn't exist
    if not os.path.exists(extract_dir):
        os.makedirs(extract_dir)
    
    # Download the zip file
    if not download_file(download_url, zip_file):
        return
    
    # Extract the zip file
    if not extract_zip(zip_file, extract_dir):
        return
    
    # Determine the project type
    project_type = check_project_type(extract_dir)
    print_step(f"Detected project type: {project_type}")
    
    if project_type == 'unknown':
        print("Could not determine the project type. Please check the contents manually.")
        return
    
    # Install dependencies
    if not install_dependencies(extract_dir, project_type):
        print("Failed to install dependencies. Please check the logs for errors.")
        return
    
    # Run the application
    print_step("Project setup completed successfully")
    print("Starting the application...")
    time.sleep(2)  # Give a moment to read the message
    
    run_application(extract_dir, project_type)
    
    print("\nSetup and execution complete!")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\nOperation canceled by user")
    except Exception as e:
        print(f"An unexpected error occurred: {str(e)}")
