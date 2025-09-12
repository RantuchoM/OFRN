import subprocess
import json
import sys

def get_final_imslp_link_with_yt_dlp(initial_link):
  """
  Uses yt-dlp to find the final URL by handling redirects and website protections.
  
  Returns the final URL as a string.
  """
  try:
    # Build the yt-dlp command.
    # We now call it as a module of the Python interpreter, which is more reliable.
    command = [sys.executable, '-m', 'yt_dlp', '--get-url', initial_link]

    # Run the command and capture the output.
    result = subprocess.run(command, capture_output=True, text=True, check=True)
    
    # The final URL is in the standard output.
    final_link = result.stdout.strip()
    
    return final_link

  except subprocess.CalledProcessError as e:
    # This block handles errors if yt-dlp fails (e.g., if the link is invalid).
    print(f"Error processing link {initial_link}:")
    print(e.stderr)
    return None
  except FileNotFoundError:
    # This block handles the case where yt-dlp is not found.
    print("Error: 'yt-dlp' command not found. Please ensure yt-dlp is installed and in your system's PATH.")
    return None

# List of initial IMSLP links to process.
imslp_links = [
  "https://imslp.org/images/8/86/PMLP659197-Weill_-_Violinkonzert_Op._12.pdf",
  "https://imslp.org/images/b/be/PMLP659197-Kurt_Weill_-_Violin_Concerto_-_(Violin_Part).pdf",
  "https://imslp.org/images/5/58/PMLP659197-Flutes.pdf",
  "https://imslp.org/images/e/e7/PMLP659197-Oboe.pdf",
  "https://imslp.org/images/3/30/PMLP659197-Clarinets.pdf",
  "https://imslp.org/images/c/ce/PMLP659197-Bassoons.pdf",
  "https://imslp.org/images/7/7e/PMLP659197-Horns.pdf",
  "https://imslp.org/images/c/ca/PMLP659197-Trumpet.pdf",
  "https://imslp.org/images/4/4d/PMLP659197-Percussion.pdf",
  "https://imslp.org/images/3/38/PMLP659197-Bass.pdf",
  "https://imslp.org/images/5/56/PMLP659197-Weill_VC_red.pdf"
]

# Process each link and print the results.
print("Starting link resolution...")
for link in imslp_links:
  final_link = get_final_imslp_link_with_yt_dlp(link)
  if final_link:
    print(f"Initial link: {link}")
    print(f"Final download link: {final_link}")
    print("-" * 50)
print("Finished.")