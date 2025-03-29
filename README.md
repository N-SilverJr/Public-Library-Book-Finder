# Public Library Book Finder

A simple web application to search for books using the Open Library API, with randomized suggestions on load.

## Features
- **Search**: Find books by title, author, or subject with sorting and filtering options.
- **Suggestions**: Displays 5 random fiction books on page load (from a pool of 50), hidden on search.
- **Book Details**: Shows cover images and summaries (click to view) fetched from the Open Library API.

## API Used
- **Open Library API**: https://openlibrary.org/developers/api
  - Provides book metadata, cover images, and summaries. No API key required.

## Local Setup
1. Clone the repo: `git clone <your-repo-url>`
2. Navigate to the folder: `cd Public-Library-Book-Finder`
3. Run a local server: `python -m http.server`
4. Open in browser: `http://localhost:8000`

## Deployment Instructions
### Prerequisites
- Two web servers (Web01, Web02) with Apache installed.
- One load balancer (Lb01) with HAProxy.
- SSH access to all servers.

### Deploying to Web Servers
1. **Copy Files**:
   - `scp -r ./* user@<web01-ip>:/var/www/html/`
   - Repeat for Web02.
2. **Set Permissions**:
   - `sudo chown -R www-data:www-data /var/www/html`
   - `sudo chmod -R 755 /var/www/html`
3. **Start Nginx**:
   - `sudo systemctl start nginx`
   - `sudo systemctl enable nginx`
4. **Test**:
   - Visit `http://<web01-ip>/` and `http://<web02-ip>/`.

### Configuring the Load Balancer
1. **Install HAProxy**:
   - `sudo apt install haproxy -y`
2. **Edit Config**:
   - `sudo nano /etc/haproxy/haproxy.cfg`
   - **Add**:
    - frontend http_front
    - bind *:80
    - mode http
    - default_backend http_back
    - backend http_back
    - mode http
    - balance roundrobin
    - server web01 <web01-ip>:80 check
    - server web02 <web02-ip>:80 check

   3. **Restart HAProxy**:
- `sudo systemctl restart haproxy`
- `sudo systemctl enable haproxy`
4. **Test**:
- Visit `http://<lb01-ip>/`; ensure app loads and traffic balances.

## Challenges
- Added book covers using Open Library’s cover API with placeholders for missing images.
- Implemented clickable summaries by fetching work data, handling inconsistent formats.
- Randomized suggestions by fetching 50 fiction books and shuffling client-side, ensuring variety per visit.
- Removed suggestions on search by hiding the section, keeping the UI focused on user results.

## Credits
- **Open Library API**: For book data (https://openlibrary.org/developers/api).
- **Unsplash**: Background image (https://unsplash.com).

## Demo Video
- [https://youtu.be/ErTBbjsDBL0]
