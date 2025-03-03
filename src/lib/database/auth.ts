import { hashSync, compareSync } from 'bcryptjs';
import { PASSPHRASE } from '$env/static/private';

const SALT_ROUNDS = 6;

// Function to derive a secret key from the PASSPHRASE
// This will run once when the module is imported
let secretKeyPromise: Promise<CryptoKey>;

async function initSecretKey() {
  const encoder = new TextEncoder();
  const passphraseData = encoder.encode(String(PASSPHRASE));
  
  // Hash the passphrase using SHA-256
  const hashBuffer = await crypto.subtle.digest('SHA-256', passphraseData);
  
  // Import the key for AES-CBC use
  return crypto.subtle.importKey(
    'raw',
    hashBuffer.slice(0, 32), // Take first 32 bytes (256 bits)
    { name: 'AES-CBC' },
    false, // not extractable
    ['encrypt', 'decrypt'] // usages
  );
}

// Initialize the secret key
secretKeyPromise = initSecretKey();

// These bcrypt functions remain unchanged
export function hashPassword(password: string): string {
  return hashSync(password, SALT_ROUNDS);
}

export function verifyPassword(password: string, hash: string): boolean {
  return compareSync(password, hash);
}

// Modified to use Web Crypto API
export async function encryptString(text: string): Promise<string> {
  const secretKey = await secretKeyPromise;
  
  // Generate a random IV
  const iv = crypto.getRandomValues(new Uint8Array(16));
  
  // Encode the text
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  
  // Encrypt the data
  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-CBC',
      iv: iv
    },
    secretKey,
    data
  );
  
  // Convert to hex strings
  const ivHex = Array.from(iv)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
    
  const encryptedHex = Array.from(new Uint8Array(encryptedBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  // Return the combined string
  return `${ivHex}:${encryptedHex}`;
}

export async function decrypt(encryptedData: string): Promise<string> {
  const secretKey = await secretKeyPromise;
  
  // Split the IV and encrypted data
  const textParts = encryptedData.split(':');
  const ivHex = textParts.shift()!;
  const encryptedHex = textParts.join(':');
  
  // Convert from hex strings to Uint8Arrays
  const iv = new Uint8Array(ivHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
  const encryptedArray = new Uint8Array(encryptedHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
  
  // Decrypt the data
  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: 'AES-CBC',
      iv: iv
    },
    secretKey,
    encryptedArray
  );
  
  // Decode the result back to a string
  const decoder = new TextDecoder();
  return decoder.decode(decryptedBuffer);
}