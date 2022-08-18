package com.shzlw.poli.util;

import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;

public final class PasswordUtils {

    private PasswordUtils() {}

    public static String encrypt(String value) {
        return encrypt(value, Constants.ENCRYPT_IV, Constants.ENCRYPT_KEY);
    }

    public static String decrypt(String value) {
        return decrypt(value, Constants.ENCRYPT_IV, Constants.ENCRYPT_KEY);
    }

    public static String encrypt(String value, String initVector, String key) {
        String rt = "";
        try {
            IvParameterSpec iv = new IvParameterSpec(initVector.getBytes("UTF-8"));
            SecretKeySpec skeySpec = new SecretKeySpec(key.getBytes("UTF-8"), "AES");

            Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5PADDING");
            cipher.init(Cipher.ENCRYPT_MODE, skeySpec, iv);
            byte[] encrypted = cipher.doFinal(value.getBytes());
            rt = new String(Base64.getEncoder().encodeToString(encrypted));
        } catch (Exception e) {
        }

        return rt;
    }

    public static String decrypt(String val, String initVector, String key) {
        String rt = "";
        try {
            IvParameterSpec iv = new IvParameterSpec(initVector.getBytes("UTF-8"));
            SecretKeySpec skeySpec = new SecretKeySpec(key.getBytes("UTF-8"), "AES");

            Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5PADDING");
            cipher.init(Cipher.DECRYPT_MODE, skeySpec, iv);

            byte[] decrypted = cipher.doFinal(Base64.getDecoder().decode(val));
            rt = new String(decrypted);
        } catch (Exception e) {
        }
        return rt;
    }

    public static String getEncryptedPassword(String password) {
        String p = password == null ? "" : password;
        return encrypt(Constants.PASSWORD_SALT + p);
    }

    public static String getDecryptedPassword(String password) {
        String p = decrypt(password);
        int saltLength = Constants.PASSWORD_SALT.length();
        return p.substring(saltLength);
    }
}
