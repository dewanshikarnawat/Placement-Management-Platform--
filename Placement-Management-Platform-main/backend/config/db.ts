import mongoose from 'mongoose';

export const connectDB = async () => {
  const primaryURI = process.env.MONGODB_URI;
  const localFallback = 'mongodb://127.0.0.1:27017/internship-platform';
  
  if (primaryURI) {
    try {
      console.log('Attempting to connect to primary MongoDB database (Env/Atlas)...');
      await mongoose.connect(primaryURI, { serverSelectionTimeoutMS: 5000 });
      console.log('Successfully connected to primary MongoDB database.');
      return;
    } catch (error) {
      console.error('Connection to primary database failed, attempting local fallback connection...', error);
    }
  }

  try {
    console.log('Connecting to local fallback MongoDB database...');
    await mongoose.connect(localFallback, { serverSelectionTimeoutMS: 3000 });
    console.log('Successfully connected to local fallback MongoDB database.');
  } catch (error) {
    console.error('Critical: MongoDB connection failed on all addresses.', error);
    console.log('Server will proceed to boot on port 5000 (endpoints will return 500 errors).');
  }
};
