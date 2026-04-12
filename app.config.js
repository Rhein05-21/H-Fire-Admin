import 'dotenv/config';

export default {
  "expo": {
    "name": "H-Fire: Admin Monitoring Center",
    "slug": "h-fire-admin",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/h-fire_logo.png",
    "scheme": "hfire-admin",
    "userInterfaceStyle": "automatic",
    "newArchEnabled": true,
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.hfire.admin",
      "config": {
        "googleMapsApiKey": process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
      }
    },
    "android": {
      "package": "com.hfire.admin",
      "adaptiveIcon": {
        "backgroundColor": "#1A0000",
        "foregroundImage": "./assets/images/h-fire_logo.png",
        "backgroundImage": "./assets/images/android-icon-background.png",
        "monochromeImage": "./assets/images/android-icon-monochrome.png"
      },
      "edgeToEdgeEnabled": true,
      "predictiveBackGestureEnabled": false,
      "config": {
        "googleMaps": {
          "apiKey": process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
        }
      }
    },
    "web": {
      "output": "static",
      "favicon": "./assets/images/favicon.png"
    },
    "plugins": [
      "expo-router",
      "expo-web-browser",
      "expo-secure-store",
      "expo-notifications",
      // Only include Sentry in production or when explicitly configured
      ...(process.env.EAS_BUILD_PROFILE === 'production' ? [[
        "@sentry/react-native/expo",
        {
          "url": "https://sentry.io/",
          "project": "h-fire-admin",
          "organization": "rhein-tigle"
        }
      ]] : []),
      [
        "expo-splash-screen",
        {
          "image": "./assets/images/splash-icon.png",
          "imageWidth": 200,
          "resizeMode": "contain",
          "backgroundColor": "#0a0a0a",
          "dark": {
            "backgroundColor": "#0a0a0a"
          }
        }
      ]
    ],
    "extra": {
      "eas": {
        "projectId": "69a01d75-3f54-41f8-b8a9-79eb726079f4"
      }
    },
    "experiments": {
      "typedRoutes": true,
      "reactCompiler": true
    }
  }
};
