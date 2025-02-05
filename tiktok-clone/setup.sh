#!/bin/bash

# Set environment variables
export PROJECT_ID="your-firebase-project-id"
export STORAGE_BUCKET="your-app-id.appspot.com"
export API_KEY="your-firebase-api-key"
export AUTH_DOMAIN="your-app-id.firebaseapp.com"
export DATABASE_URL="https://your-app-id.firebaseio.com"
export FIREBASE_API="https://firestore.googleapis.com/v1/projects/$PROJECT_ID/databases/(default)/documents"
export FIREBASE_AUTH_TOKEN="your-firebase-auth-token"

# Function to authenticate via Firebase CLI (only for the first time)
firebase_login() {
    echo "Logging in with Firebase..."
    firebase login --no-localhost
}

# Function to upload a video file to Firebase Storage
upload_video_to_firebase() {
    FILE_PATH=$1
    FILENAME=$(basename $FILE_PATH)

    echo "Uploading video: $FILENAME..."

    # Upload the file to Firebase Storage
    firebase storage:upload $FILE_PATH --bucket $STORAGE_BUCKET --path "videos/$FILENAME"

    if [ $? -eq 0 ]; then
        echo "Upload successful!"
    else
        echo "Upload failed!"
    fi
}

# Function to add video metadata to Firestore
add_video_to_firestore() {
    VIDEO_URL=$1
    USERNAME=$2
    USER_ID=$3
    TIMESTAMP=$(date +%s)

    # Use curl to send a request to Firestore API
    curl -X POST $FIREBASE_API/videos \
    -H "Authorization: Bearer $FIREBASE_AUTH_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "fields": {
            "videoUrl": { "stringValue": "'"$VIDEO_URL"'" },
            "username": { "stringValue": "'"$USERNAME"'" },
            "userId": { "stringValue": "'"$USER_ID"'" },
            "timestamp": { "integerValue": "'"$TIMESTAMP"'" }
        }
    }'

    if [ $? -eq 0 ]; then
        echo "Video metadata added to Firestore!"
    else
        echo "Failed to add metadata to Firestore!"
    fi
}

# Function to fetch videos from Firestore
fetch_videos() {
    echo "Fetching videos from Firestore..."

    # Use curl to fetch video data from Firestore
    curl -X GET $FIREBASE_API/videos \
    -H "Authorization: Bearer $FIREBASE_AUTH_TOKEN"

    if [ $? -eq 0 ]; then
        echo "Videos fetched successfully!"
    else
        echo "Failed to fetch videos!"
    fi
}

# Main function
main() {
    echo "Choose an operation:"
    echo "1. Login with Firebase"
    echo "2. Upload Video to Firebase Storage"
    echo "3. Add Video Metadata to Firestore"
    echo "4. Fetch Videos from Firestore"
    read -p "Enter your choice (1-4): " choice

    case $choice in
        1)
            firebase_login
            ;;
        2)
            read -p "Enter the path to the video file: " file_path
            upload_video_to_firebase $file_path
            ;;
        3)
            read -p "Enter the video URL: " video_url
            read -p "Enter your username: " username
            read -p "Enter your user ID: " user_id
            add_video_to_firestore $video_url $username $user_id
            ;;
        4)
            fetch_videos
            ;;
        *)
            echo "Invalid choice, please select between 1-4."
            ;;
    esac
}

# Run the main function
main
