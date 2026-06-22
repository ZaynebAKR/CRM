package com.crm.backend;

import javax.net.ssl.HttpsURLConnection;
import java.net.URL;
public class TestSsl {
    public static void main(String[] args) {
        try {
            URL url = new URL("https://www.google.com");
            HttpsURLConnection conn = (HttpsURLConnection) url.openConnection();
            conn.setConnectTimeout(5000);
            conn.setReadTimeout(5000);
            int code = conn.getResponseCode();
            System.out.println("SUCCESS - response code: " + code);
        } catch (Exception e) {
            System.out.println("FAILED: " + e.getClass().getName() + " - " + e.getMessage());
            e.printStackTrace();
        }
    }
}
