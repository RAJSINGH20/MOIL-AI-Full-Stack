import 'dotenv/config';
import mongoose from 'mongoose';

function invalidMongoUri(message) {
  const error = new Error(message);
  error.code = 'INVALID_MONGODB_URI';
  return error;
}

function validateMongoUri(uri) {
  if (!uri) {
    throw invalidMongoUri('MONGODB_URI is not set. Add it to the backend .env file.');
  }

  if (!/^mongodb(?:\+srv)?:\/\//i.test(uri) || /\s/.test(uri)) {
    throw invalidMongoUri('MONGODB_URI must be a valid mongodb:// or mongodb+srv:// URI.');
  }

  let parsed;
  try {
    parsed = new URL(uri);
    if (!parsed.hostname) throw new Error('Missing MongoDB hostname.');
    // Reject malformed percent escapes without ever including credential values in an error.
    decodeURIComponent(parsed.username);
    decodeURIComponent(parsed.password);
  } catch {
    throw invalidMongoUri('MONGODB_URI is malformed. Check the host and percent-encoding.');
  }

  const authority = uri.slice(uri.indexOf('//') + 2).split(/[/?#]/, 1)[0];
  const at = authority.lastIndexOf('@');
  if (at !== -1) {
    const userInfo = authority.slice(0, at);
    const separator = userInfo.indexOf(':');
    const credentials = separator === -1
      ? [userInfo]
      : [userInfo.slice(0, separator), userInfo.slice(separator + 1)];
    if (credentials.some(value => /[/:?#\[\]@!$&'()*+,;= ]/.test(value))) {
      throw invalidMongoUri('MongoDB URI credentials contain reserved characters; percent-encode them.');
    }
  }

  return uri;
}

function classifyMongoError(error) {
  const chain = [];
  for (let current = error; current && !chain.includes(current); current = current.cause) {
    chain.push(current);
  }

  const text = chain.map(item => `${item.name || ''} ${item.message || ''} ${item.code || ''}`).join(' ').toLowerCase();
  if (chain.some(item => item.code === 18) || /bad auth|authentication failed|auth failed/.test(text)) return 'authentication failure';
  if (chain.some(item => item.code === 'INVALID_MONGODB_URI') || /mongoparseerror|invalid uri|malformed uri/.test(text)) return 'invalid URI';
  if (/querysrv|querytxt|enotfound|eai_again|dns|name or service not known/.test(text)) return 'DNS/network failure';
  if (/timed out|timeout|etimedout/.test(text)) return 'timeout';
  if (chain.some(item => item.name === 'MongoServerSelectionError')) return 'server selection failure';
  if (/econnrefused|econnreset|network|socket/.test(text)) return 'DNS/network failure';
  return 'connection failure';
}

const connectDB = async () => {
  try {
    const uri = validateMongoUri(process.env.MONGODB_URI);
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    console.log('MongoDB connected');
  } catch (error) {
    // Do not print the URI or credential-bearing driver objects to logs.
    console.error(`MongoDB ${classifyMongoError(error)}: ${error.message?.replace(/mongodb(?:\+srv)?:\/\/[^\s"']+/gi, '[MongoDB URI]') || 'connection could not be established'}`);
    throw error;
  }
};

export default connectDB;
