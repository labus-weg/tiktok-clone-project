'use client';
import { useEffect, useState } from 'react';
import { auth, db, storage } from './firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { collection, addDoc, getDocs, orderBy, query } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function Home() {
  const [user, setUser] = useState(null);
  const [videos, setVideos] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    fetchVideos();
    return unsubscribe;
  }, []);

  const fetchVideos = async () => {
    const videosQuery = query(collection(db, 'videos'), orderBy('timestamp', 'desc'));
    const videosDocs = await getDocs(videosQuery);
    setVideos(videosDocs.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error(error);
    }
  };

  const uploadVideo = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const fileRef = ref(storage, `videos/${auth.currentUser.uid}/${Date.now()}-${file.name}`);
      await uploadBytes(fileRef, file);
      const videoUrl = await getDownloadURL(fileRef);

      await addDoc(collection(db, 'videos'), {
        videoUrl,
        username: user.displayName,
        userId: user.uid,
        timestamp: new Date(),
        likes: 0,
        comments: []
      });
      
      fetchVideos();
    } catch (error) {
      console.error(error);
    }
    setUploading(false);
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <nav className="fixed top-0 w-full bg-black/90 border-b border-gray-800 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">TikTok Clone</h1>
          {!user ? (
            <button
              onClick={signIn}
              className="bg-red-500 px-4 py-2 rounded-full hover:bg-red-600"
            >
              Sign In
            </button>
          ) : (
            <div className="flex items-center gap-4">
              <img
                src={user.photoURL}
                alt="Profile"
                className="w-8 h-8 rounded-full"
              />
              <button
                onClick={() => auth.signOut()}
                className="text-red-500 hover:text-red-600"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </nav>

      <div className="pt-16 pb-20 px-4">
        <div className="max-w-md mx-auto space-y-8">
          {user && (
            <div className="text-center">
              <input
                type="file"
                accept="video/*"
                onChange={uploadVideo}
                className="hidden"
                id="video-upload"
              />
              <label
                htmlFor="video-upload"
                className="inline-block bg-red-500 px-6 py-3 rounded-full cursor-pointer hover:bg-red-600"
              >
                {uploading ? 'Uploading...' : 'Upload Video'}
              </label>
            </div>
          )}

          {videos.map((video) => (
            <div key={video.id} className="bg-gray-900 rounded-lg overflow-hidden">
              <video
                src={video.videoUrl}
                className="w-full"
                controls
                loop
              />
              <div className="p-4">
                <p className="font-semibold">{video.username}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                  <button className="hover:text-red-500">
                    ♥ {video.likes}
                  </button>
                  <button className="hover:text-blue-500">
                    💬 {video.comments?.length || 0}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
