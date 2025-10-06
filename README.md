# Cold Call App

A React Native Expo app for making cold calls without saving numbers to your phone's contact list. Designed for sales professionals, recruiters, and anyone who needs to make frequent calls while keeping detailed call logs.

## Features

### Core Functionality

- **Quick Phone Dialing**: Enter any phone number and make calls instantly without saving to contacts
- **Smart Autocomplete**: As you type, see suggestions from previously called numbers
- **Call Logging**: After each call, log important details including:
  - Contact label/name
  - Call status (Interested, Not Answered, Rejected, Follow Up)
  - Automatic timestamp
- **Call History**: View all previous calls with complete details
- **Persistent Storage**: All call logs stored locally using AsyncStorage

### User Interface

- Clean, modern design using React Native Paper
- Tab-based navigation with two main screens:
  - **Call Tab**: Make calls and see suggestions
  - **History Tab**: View all past calls
- Pull-to-refresh on history screen
- Status color coding for easy visual scanning

## Technology Stack

- **Framework**: Expo SDK 54+ with Expo Router
- **Language**: TypeScript
- **UI Library**: React Native Paper
- **Storage**: AsyncStorage
- **Navigation**: Expo Router (Tab Navigation)
- **Icons**: Lucide React Native
- **Phone Calling**: React Native Linking API

## Project Structure

```
project/
├── app/
│   ├── _layout.tsx              # Root layout with PaperProvider
│   ├── +not-found.tsx           # 404 screen
│   └── (tabs)/
│       ├── _layout.tsx          # Tab navigation configuration
│       ├── index.tsx            # Call screen (home)
│       └── history.tsx          # Call history screen
├── components/
│   └── CallLogModal.tsx         # Modal for logging call details
├── services/
│   └── storage.ts               # AsyncStorage service
├── types/
│   └── call.ts                  # TypeScript interfaces
├── hooks/
│   └── useFrameworkReady.ts     # Framework initialization hook
└── package.json
```

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

## Dependencies

### Core Dependencies
- `expo` - Expo framework
- `expo-router` - File-based routing
- `react-native` - React Native framework
- `react` - React library

### UI & Styling
- `react-native-paper` - Material Design components
- `lucide-react-native` - Modern icon library
- `@react-native-picker/picker` - Dropdown picker component

### Storage & Utilities
- `@react-native-async-storage/async-storage` - Local storage
- `expo-linking` - Deep linking and URL handling (for phone calls)

### Navigation
- `@react-navigation/native` - Navigation library
- `@react-navigation/bottom-tabs` - Tab navigation
- `react-native-safe-area-context` - Safe area handling
- `react-native-screens` - Native screen components

## How to Use

### Making a Call

1. Open the app to the **Call** tab
2. Enter a phone number in the text input
3. If you've called this number before, you'll see autocomplete suggestions
4. Tap the **Call** button to initiate the call
5. After the call, a modal will appear automatically

### Logging a Call

1. After making a call, the log modal appears
2. Enter a label (e.g., "John Doe", "ABC Company")
3. Select a status from the dropdown:
   - **Interested** - Contact showed interest
   - **Not Answered** - No response
   - **Rejected** - Not interested
   - **Follow Up** - Needs follow-up call
4. Tap **Save** to store the call log

### Viewing History

1. Navigate to the **History** tab
2. View all previous calls sorted by most recent
3. See details for each call:
   - Phone number
   - Label/name
   - Status (color-coded)
   - Date and time
4. Pull down to refresh the list

## Status Colors

- **Interested**: Green
- **Follow Up**: Orange
- **Rejected**: Red
- **Not Answered**: Gray

## Data Storage

All call logs are stored locally on your device using AsyncStorage. The data includes:
- Unique ID for each call
- Phone number
- Label/name
- Status
- Timestamp

Data persists between app sessions and is only stored on your device.

## Building for Production

### Web Build
```bash
npm run build:web
```

### Type Checking
```bash
npm run typecheck
```

### Linting
```bash
npm run lint
```

## Platform Support

- **iOS**: Full support
- **Android**: Full support
- **Web**: Full support (phone calling opens default dialer)

## Future Enhancements (Optional)

- Filter history by status
- Search history by label or number
- Export call logs as CSV or JSON
- Call statistics and analytics
- Notes field for detailed call information
- Cloud sync across devices
- Bulk import/export contacts

## Troubleshooting

### Phone Calls Not Working
- Ensure your device supports phone calls
- Check that the phone number format is correct
- On iOS simulator, calls won't work (test on real device)

### Data Not Persisting
- Check AsyncStorage permissions
- Ensure the app has proper storage access

### Suggestions Not Showing
- Make at least one call and log it first
- Ensure you're typing at least 3 characters
- Check that AsyncStorage is working properly

## License

MIT License

## Support

For issues or feature requests, please create an issue in the repository.
