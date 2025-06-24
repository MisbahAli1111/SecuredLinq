# SecureCam 📸🔒

A secure camera application built with React Native and Expo that allows users to capture photos and videos with a step-by-step onboarding process and secure local storage.

## Features ✨

- **Beautiful Dashboard**: Modern UI with gradient backgrounds and intuitive navigation
- **Step-by-Step Capture Process**: Guided onboarding flow for taking 2 photos and 1 video (20 seconds)
- **Secure Storage**: All media is stored locally using AsyncStorage for privacy
- **Media Gallery**: View all captured media in a beautiful grid layout
- **Full-Screen Preview**: View photos and videos in full-screen mode with controls
- **Delete Management**: Delete individual items or clear all media
- **Professional UI**: Modern design with animations and smooth transitions

## Technology Stack 🛠️

- **React Native**: Cross-platform mobile development
- **Expo**: Development platform and tools
- **React Navigation**: Navigation management
- **Expo Camera**: Camera functionality
- **Expo AV**: Video recording and playback
- **AsyncStorage**: Local data persistence
- **Linear Gradient**: Beautiful gradient backgrounds
- **Ionicons**: Beautiful icons

## Project Structure 📁

```
SecureCam/
├── src/
│   ├── components/
│   │   ├── Dashboard.js          # Main dashboard screen
│   │   ├── CaptureProcess.js     # Step-by-step capture flow
│   │   ├── SavedMediaModal.js    # Media gallery modal
│   │   └── index.js              # Component exports
│   └── utils/
│       └── storage.js            # AsyncStorage utilities
├── App.js                        # Main app component with navigation
├── app.json                      # Expo configuration
└── package.json                  # Dependencies
```

## Installation & Setup 🚀

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd SecureCam
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

4. **Run on device/simulator**:
   - For iOS: `npm run ios`
   - For Android: `npm run android`
   - For Web: `npm run web`

## Usage 📱

1. **Dashboard**: Launch the app to see the SecureCam dashboard with feature overview
2. **Start Capture**: Tap "Start Capture" to begin the guided process
3. **Step-by-Step Flow**:
   - Step 1: Take your first photo
   - Step 2: Take your second photo  
   - Step 3: Record a 20-second video
4. **View Media**: Use "View Saved Media" to see all captured content
5. **Full-Screen View**: Tap any media item to view in full-screen
6. **Management**: Delete individual items or clear all media

## Permissions 🔐

The app requires the following permissions:
- **Camera**: To take photos and record videos
- **Microphone**: To record audio with videos
- **Media Library**: To save captured media locally

## Features in Detail 🎯

### Dashboard Component
- Gradient background with professional styling
- Feature list with icons
- Navigation to capture process
- Access to saved media gallery

### Capture Process Component
- Step-by-step guided flow
- Progress indicator
- Real-time camera preview
- Recording timer for videos
- Automatic step progression
- Skip functionality

### Saved Media Modal
- Grid layout for media thumbnails
- Full-screen preview modal
- Individual delete functionality
- Bulk delete (clear all)
- Sorting by timestamp
- Loading states and empty states

## Storage 💾

All media is stored locally using AsyncStorage with the following structure:
```json
{
  "id": "timestamp",
  "type": "photo|video",
  "uri": "file://path/to/media",
  "timestamp": "ISO date string",
  "step": "1|2|3",
  "duration": "video duration in seconds"
}
```

## Contributing 🤝

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License 📄

This project is licensed under the 0BSD License - see the package.json file for details.

---

Built with ❤️ using React Native and Expo 