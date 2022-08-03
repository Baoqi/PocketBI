package com.shzlw.poli.dto;

import java.util.ArrayList;
import java.util.List;

public class Table {

    private String schema;
    private String name;
    private String type;
    private List<Column> columns = new ArrayList<>();

    public Table(String schema, String name, String type) {
        this.schema = schema;
        this.name = name;
        this.type = type;
    }

    public String getSchema() {
        return schema;
    }

    public String getName() {
        return name;
    }

    public String getType() {
        return type;
    }

    public List<Column> getColumns() {
        return columns;
    }

    public void setColumns(List<Column> columns) {
        this.columns = columns;
    }
}
