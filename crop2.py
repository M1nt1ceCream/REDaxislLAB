import cv2
import numpy as np
import os
import sys

# Change default encoding
sys.stdout.reconfigure(encoding='utf-8')

img_path = r'C:\Users\m1n1_1ce_cream\.gemini\antigravity\brain\be464b05-89c1-41ac-91b0-90771c16dc1a\media__1778788954130.png'
out_dir = r'c:\Users\m1n1_1ce_cream\Documents\redshift-lab-site\icons'

print('Loading image...')
img = cv2.imdecode(np.fromfile(img_path, dtype=np.uint8), cv2.IMREAD_COLOR)
if img is None:
    print('Failed to load image')
    exit(1)

# Convert to grayscale
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

# Threshold to find the non-black area (the collage)
_, thresh = cv2.threshold(gray, 10, 255, cv2.THRESH_BINARY)
contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

if not contours:
    print('No contours found')
    exit(1)

# Find largest contour (the collage)
c = max(contours, key=cv2.contourArea)
x, y, w, h = cv2.boundingRect(c)
collage = img[y:y+h, x:x+w]

print(f'Collage bounded at {x}, {y}, {w}, {h}')

h_c, w_c, _ = collage.shape
row1_h = h_c // 2
row2_h = h_c - row1_h

# Images
img1 = collage[0:row1_h, 0:w_c//2]
img2 = collage[0:row1_h, w_c//2:w_c]
img3 = collage[row1_h:h_c, 0:w_c//3]
img4 = collage[row1_h:h_c, w_c//3:2*w_c//3]
img5 = collage[row1_h:h_c, 2*w_c//3:w_c]

images = [img1, img2, img3, img4, img5]

os.makedirs(out_dir, exist_ok=True)

for i, face in enumerate(images):
    # Convert to pure grayscale
    face_gray = cv2.cvtColor(face, cv2.COLOR_BGR2GRAY)
    
    # Make square by cropping the center
    fh, fw = face_gray.shape
    size = min(fh, fw)
    start_y = (fh - size) // 2
    start_x = (fw - size) // 2
    face_sq = face_gray[start_y:start_y+size, start_x:start_x+size]
    
    # Resize to a consistent size like 400x400
    face_sq = cv2.resize(face_sq, (400, 400), interpolation=cv2.INTER_AREA)
    
    out_path = os.path.join(out_dir, f'spec_{i+1}.jpg')
    cv2.imencode('.jpg', face_sq)[1].tofile(out_path)
    print(f'Saved {out_path}')

print('Done')