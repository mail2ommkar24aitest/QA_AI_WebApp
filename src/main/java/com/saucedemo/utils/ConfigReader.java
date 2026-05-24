package com.saucedemo.utils;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

/**
 * ConfigReader loads property values from the config.properties file.
 * This class is designed to keep configuration retrieval centralized and clean.
 */
public class ConfigReader {
    private static Properties properties;

    static {
        try {
            properties = new Properties();
            // Load via ClassLoader from resources directory
            InputStream inputStream = ConfigReader.class.getClassLoader().getResourceAsStream("config.properties");
            if (inputStream == null) {
                // Fallback to direct file loading if class loader stream is not found (e.g. during certain IDE executions)
                FileInputStream fileInputStream = new FileInputStream("src/main/resources/config.properties");
                properties.load(fileInputStream);
                fileInputStream.close();
            } else {
                properties.load(inputStream);
                inputStream.close();
            }
        } catch (IOException e) {
            System.err.println("Error: Unable to load config.properties file. Details: " + e.getMessage());
            throw new RuntimeException("Could not load config.properties file.", e);
        }
    }

    /**
     * Retrieves the value of a property by its key.
     * @param key The key of the property to search for.
     * @return The property value, or null if not found.
     */
    public static String getProperty(String key) {
        return properties.getProperty(key);
    }
}
