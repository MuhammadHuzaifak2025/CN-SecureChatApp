'use server';
import { cookies } from "next/headers"

export const setCookies = async  (cookieHeader: string) => {
    console.log(cookieHeader)
    const cookieStore = await cookies()
    const parts = cookieHeader.split(';').map(part => part.trim());
  const [nameValue, ...attrParts] = parts;
  const [name, value] = nameValue.split('=');

  const cookieOptions: any = {
    httpOnly: true,
  };

  attrParts.forEach(attr => {
    const [key, val] = attr.includes('=') ? attr.split('=') : [attr, true];
    const attrKey = key.toLowerCase();

    switch (attrKey) {
      case 'path':
        cookieOptions.path = val || '/';
        break;
      case 'max-age':
        cookieOptions.maxAge = parseInt(typeof val === 'string' ? val : '0');
        break;
      case 'expires':
        cookieOptions.expires = new Date(typeof val === 'string' ? val : Date.now());
        break;
      case 'secure':
        cookieOptions.secure = true;
        break;
      case 'httponly':
        cookieOptions.httpOnly = true;
        break;
      case 'samesite':
        cookieOptions.sameSite = val;
        break;
      default:
        break;
    }
  });

  cookieStore.set(name, value, cookieOptions);
}