package com.saucedemo.utils;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * CsvUtils provides reusable helper methods to fetch dynamic test data from CSV resource files.
 * Designed for clean BDD and POM test data injection.
 */
public class CsvUtils {

    /**
     * Reads a CSV file from the testdata resources directory and returns it as a List of Maps.
     * Each Map represents a row, mapping the CSV column header to its row value.
     * 
     * @param csvFileName The name of the CSV file under resources/testdata (e.g. "loginData.csv")
     * @return List of Row Maps.
     */
    public static List<Map<String, String>> readCsvData(String csvFileName) {
        List<Map<String, String>> dataList = new ArrayList<>();
        String resourcePath = "/testdata/" + csvFileName;
        
        try (InputStream is = CsvUtils.class.getResourceAsStream(resourcePath)) {
            if (is == null) {
                throw new IllegalArgumentException("CSV resource file not found: " + resourcePath);
            }
            
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8));
                 CSVParser csvParser = new CSVParser(reader, CSVFormat.Builder.create(CSVFormat.DEFAULT)
                         .setHeader()
                         .setIgnoreHeaderCase(true)
                         .setTrim(true)
                         .build())) {
                
                for (CSVRecord record : csvParser) {
                    dataList.add(record.toMap());
                }
            }
        } catch (Exception e) {
            System.err.println("CRITICAL ERROR: Failed to read CSV test data file '" + csvFileName + "'. Reason: " + e.getMessage());
            e.printStackTrace();
        }
        
        return dataList;
    }

    /**
     * Helper method to retrieve a single row matching a key-value condition (e.g. username matches "standard_user").
     */
    public static Map<String, String> getRowByFilter(String csvFileName, String filterColumn, String filterValue) {
        List<Map<String, String>> allData = readCsvData(csvFileName);
        for (Map<String, String> row : allData) {
            if (row.containsKey(filterColumn) && row.get(filterColumn).equalsIgnoreCase(filterValue)) {
                return row;
            }
        }
        return null;
    }
}
