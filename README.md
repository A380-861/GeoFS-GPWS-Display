GeoFS GPWS Display Lite
A lightweight GPWS (Ground Proximity Warning System) display plugin for GeoFS flight simulator. Shows real-time flight safety alerts in the top-left corner, with detailed flight data available via Alt+D shortcut.

Features
🚨 Clean Alert Display: Shows only active alerts in the top-left corner

📊 Detail Information Window: Press Alt+D for complete flight data

🎯 Real-time Monitoring: Monitors critical flight safety parameters

🎨 Modern UI: Semi-transparent, modern design

⚡ Lightweight: No audio, only visual alerts

⌨️ Keyboard Shortcuts: Easy access with Alt+D and ESC

Installation
Method 1: Direct Install (Recommended)
Install a userscript manager:

Chrome: Tampermonkey

Firefox: Greasemonkey or Tampermonkey

Edge: Tampermonkey

Click the installation link:
Install Script

Method 2: Manual Installation
Copy the complete JavaScript code from the script file

Open your userscript manager

Click "Add new script"

Paste the code and save

Visit GeoFS website to use

Usage
Basic Operations
Default State: Alerts displayed in top-left corner

Open Detail Window: Press Alt + D

Close Detail Window: Press ESC or click outside the window

Alert Colors:

🔴 Red: Critical alerts (e.g., stall)

🟡 Yellow: Warning alerts

🟢 Green: Information alerts

Monitored Alert Types
Altitude Alerts: 2500, 2000, 1000, 500, 400, 300, 200, 100, 50, 40, 30, 20, 10, 5 feet

Stall Alert: When aircraft is stalling

Bank Angle: Exceeding 30° or 45°

Overspeed: Exceeding 105% of aircraft max speed

Too Low Gear/Flaps: Gear or flaps not deployed at low altitude

Sink Rate: Excessive descent rate

Autopilot Disconnect: When autopilot disconnects

Approaching Ground: Alert when near ground

High Taxi Speed: Excessive speed on ground

Technical Details
Dependencies
Requires GeoFS flight simulator environment

Depends on GeoFS API interface

Compatibility
Compatible with latest GeoFS versions

Works on Chrome, Firefox, Edge and other modern browsers

Supports Tampermonkey and Greasemonkey userscript managers

File Structure
text
geofs-gpws-display/
├── README.md           # Documentation
├── gpws-display.user.js # Main script file
├── screenshot.png      # Screenshot
└── LICENSE            # License file
Customization
Configurable options in code:

javascript
// Alert display limit
const MAX_ALERTS_DISPLAY = 4;

// Alert expiration time (milliseconds)
const ALERT_EXPIRE_TIME = 3000;

// Shortcut keys
// Alt + D to toggle detail window
Troubleshooting
Common Issues
Script Not Working

Ensure userscript manager is installed

Refresh GeoFS page

Check if script is enabled

Alerts Not Displaying

Verify aircraft is loaded

Ensure flight data is available

Try reinstalling the script

Shortcut Not Working

Check if other extensions are using Alt+D

Test in another browser

Debugging
Open browser console (F12) to check for error messages.

Contributing
Issues and Pull Requests are welcome!

Fork the repository

Create a feature branch (git checkout -b feature/AmazingFeature)

Commit changes (git commit -m 'Add some AmazingFeature')

Push to branch (git push origin feature/AmazingFeature)

Open a Pull Request

License
This project is licensed under the MIT License. See LICENSE for details.

Credits
Thanks to GeoFS development team for the excellent flight simulator

Inspired by the original GPWS plugin

Thanks to all contributors and users

Changelog
v1.0.1
Optimized alert display logic

Improved detail window layout

Fixed known issues

v1.0.0
Initial release

Basic alert display functionality

Added detail information window

Contact
For questions or suggestions:

Open an Issue on GitHub
