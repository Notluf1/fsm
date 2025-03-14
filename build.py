#!/usr/bin/python

import os
import sys
import argparse
import logging
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

def sources(src_path):
    """Collect all .js files from the source directory."""
    try:
        return [
            os.path.join(base, f)
            for base, _, files in os.walk(src_path)
            for f in files
            if f.endswith('.js')
        ]
    except Exception as e:
        logging.error(f"Error while collecting source files: {e}")
        sys.exit(1)

def build(src_path, output_path):
    """Concatenate all .js files into a single output file."""
    try:
        files = sources(src_path)
        if not files:
            logging.warning("No .js files found in the source directory.")
            return

        data = '\n'.join(open(file, 'r').read() for file in files)
        with open(output_path, 'w') as f:
            f.write(data)
        logging.info(f"Built {output_path} ({len(data)} bytes)")
    except Exception as e:
        logging.error(f"Error during build: {e}")
        sys.exit(1)

def stat(src_path):
    """Get the last modification time of all .js files."""
    return [os.stat(file).st_mtime for file in sources(src_path)]

class SourceChangeHandler(FileSystemEventHandler):
    """Handler for file system events."""
    def __init__(self, src_path, output_path):
        self.src_path = src_path
        self.output_path = output_path
        self.last_state = stat(src_path)

    def on_modified(self, event):
        """Triggered when a file is modified."""
        if not event.is_directory and event.src_path.endswith('.js'):
            new_state = stat(self.src_path)
            if new_state != self.last_state:
                self.last_state = new_state
                logging.info(f"Detected changes in {event.src_path}")
                build(self.src_path, self.output_path)

def monitor(src_path, output_path):
    """Monitor the source directory for changes."""
    event_handler = SourceChangeHandler(src_path, output_path)
    observer = Observer()
    observer.schedule(event_handler, path=src_path, recursive=True)
    observer.start()
    logging.info(f"Monitoring {src_path} for changes...")

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()

if __name__ == '__main__':
    # Parse command-line arguments
    parser = argparse.ArgumentParser(description="Build and monitor JavaScript files.")
    parser.add_argument('--src', default='./src', help="Path to the source directory (default: ./src)")
    parser.add_argument('--output', default='./www/fsm.js', help="Path to the output file (default: ./www/fsm.js)")
    parser.add_argument('--watch', action='store_true', help="Enable watch mode")
    args = parser.parse_args()

    # Build the project
    build(args.src, args.output)

    # Start monitoring if --watch is enabled
    if args.watch:
        try:
            monitor(args.src, args.output)
        except Exception as e:
            logging.error(f"Error during monitoring: {e}")
            sys.exit(1)
