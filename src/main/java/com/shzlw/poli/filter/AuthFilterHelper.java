package com.shzlw.poli.filter;

import com.shzlw.poli.util.Constants;

import java.util.*;

public final class AuthFilterHelper {

    private AuthFilterHelper() {}

    private static final List<String> VIEWER_GET_PATH = Arrays.asList(
            "/ws/reports",
            "/ws/cannedreports",
            "/ws/components/report/",
            "/ws/users/account"
    );

    private static final List<String> VIEWER_PUT_PATH = Arrays.asList(
            "/ws/users/account"
    );

    private static final List<String> VIEWER_POST_PATH = Arrays.asList(
            "/ws/jdbcquery",
            "/ws/cannedreports"
    );

    private static final List<String> VIEWER_DELETE_PATH = Arrays.asList(
            "/ws/cannedreports"
    );

    private static final Map<String, List<String>> VIEWER_MAP;
    static {
        Map<String, List<String>> viewerTemp = new HashMap<>();
        viewerTemp.put(Constants.HTTP_METHOD_GET, VIEWER_GET_PATH);
        viewerTemp.put(Constants.HTTP_METHOD_PUT, VIEWER_PUT_PATH);
        viewerTemp.put(Constants.HTTP_METHOD_POST, VIEWER_POST_PATH);
        viewerTemp.put(Constants.HTTP_METHOD_DELETE, VIEWER_DELETE_PATH);
        VIEWER_MAP = Collections.unmodifiableMap(viewerTemp);
    }

    public static boolean validateViewer(String requestMethod, String path) {
        return isPathStartWith(path, VIEWER_MAP.get(requestMethod));
    }

    private static boolean isPathStartWith(String path, List<String> startWithList) {
        if (path == null || startWithList == null) {
            return false;
        }

        for (String s : startWithList) {
            if (path.startsWith(s)) {
                return true;
            }
        }
        return false;
    }
}
