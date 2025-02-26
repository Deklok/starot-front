import { hashSync, compareSync } from 'bcrypt';
import * as crypto from 'crypto';
import { PASSPHRASE } from '$env/static/private';

const SALT_ROUNDS = 6;

const secretKey = crypto.createHash('sha256').update(
    String(PASSPHRASE)
).digest('base64').substr(0, 32);

export function hashPassword(password: string): string {
    return hashSync(password, SALT_ROUNDS);
}

export function verifyPassword(password: string, hash: string): boolean{
    return compareSync(password, hash);
}

export function encryptString(text: string): string {
    const iv = crypto.randomBytes(16); // Initialization vector
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(secretKey), iv);
    const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
    // Return the IV and encrypted data as a combined string
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decrypt(encryptedData: string): string {
    const textParts = encryptedData.split(':');
    const iv = Buffer.from(textParts.shift()!, 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(secretKey), iv);
    const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
    return decrypted.toString('utf8');
}