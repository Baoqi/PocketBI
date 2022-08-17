package com.shzlw.poli.rest;

import com.shzlw.poli.dao.UserDao;
import com.shzlw.poli.dto.LoginResponse;
import com.shzlw.poli.model.User;
import com.shzlw.poli.service.UserService;
import com.shzlw.poli.util.Constants;
import com.shzlw.poli.util.PasswordUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@RestController
@RequestMapping("/auth")
public class AuthWs {

    @Autowired
    UserDao userDao;

    @Autowired
    UserService userService;

    public static final String INVALID_USERNAME_PASSWORD = "Invalid username or password.";
    public static final String USE_MORE_CHARACTERS = "Use 8 or more characters.";

    @RequestMapping(value="/login/user", method = RequestMethod.POST)
    @Transactional
    public LoginResponse loginByUser(@RequestBody User loginInfo, HttpServletResponse response) {
        String username = loginInfo.getUsername();
        String password = loginInfo.getPassword();

        boolean isTempPassword = false;
        User user = userDao.findByUsernameAndPassword(username, password);
        if (user == null) {
            user = userDao.findByUsernameAndTempPassword(username, password);
            if (user == null) {
                return LoginResponse.ofError(INVALID_USERNAME_PASSWORD);
            } else {
                isTempPassword = true;
            }
        }

        String oldSessionKey = user.getSessionKey();
        String newSessionKey = getNewSessionKey();
        userDao.updateSessionKey(user.getId(), newSessionKey);
        user.setUserAttributes(userDao.findUserAttributes(user.getId()));
        userService.newOrUpdateUser(user, oldSessionKey, newSessionKey);

        Cookie sessionKeyCookie = new Cookie(Constants.SESSION_KEY, newSessionKey);
        sessionKeyCookie.setMaxAge(Constants.COOKIE_TIMEOUT);
        sessionKeyCookie.setPath("/");
        response.addCookie(sessionKeyCookie);

        return LoginResponse.ofSuccess(user.getUsername(), user.getSysRole(), isTempPassword);
    }

    @RequestMapping(value="/login/cookie", method= RequestMethod.POST)
    @Transactional
    public LoginResponse loginBySessionKey(@CookieValue(value = Constants.SESSION_KEY, defaultValue = "") String sessionKey) {
        if (sessionKey.isEmpty()) {
            return LoginResponse.ofError(INVALID_USERNAME_PASSWORD);
        }

        User user = userDao.findBySessionKey(sessionKey);
        if (user == null) {
            return LoginResponse.ofError(INVALID_USERNAME_PASSWORD);
        }

        user.setUserAttributes(userDao.findUserAttributes(user.getId()));
        userService.newOrUpdateUser(user, user.getSessionKey(), sessionKey);
        return LoginResponse.ofSuccess(user.getUsername(), user.getSysRole(), false);
    }

    @RequestMapping(value="/logout", method= RequestMethod.GET)
    @Transactional
    public void logout(@CookieValue(Constants.SESSION_KEY) String sessionKey, HttpServletResponse response) throws IOException {
        User user = userDao.findBySessionKey(sessionKey);
        if (user != null) {
            userService.invalidateSessionUserCache(sessionKey);
            userDao.updateSessionKey(user.getId(), null);

            Cookie sessionKeyCookie = new Cookie(Constants.SESSION_KEY, "");
            sessionKeyCookie.setMaxAge(0);
            sessionKeyCookie.setPath("/");
            response.addCookie(sessionKeyCookie);
        }
    }

    @RequestMapping(value="/login/change-password", method= RequestMethod.POST)
    @Transactional
    public ResponseEntity<LoginResponse> changeTempPassword(@CookieValue(value = Constants.SESSION_KEY, defaultValue = "") String sessionKey,
        @RequestBody User user) {
        String password = user.getPassword();
        if (password.length() < 8) {
            return new ResponseEntity<>(LoginResponse.ofError(USE_MORE_CHARACTERS), HttpStatus.OK);
        }

        User existUser = userDao.findBySessionKey(sessionKey);
        if (existUser == null) {
            return new ResponseEntity<>(LoginResponse.ofError("Invalid session."), HttpStatus.OK);
        }

        userDao.updateTempPassword(existUser.getId(), user.getPassword());
        return new ResponseEntity<>(HttpStatus.OK);
    }

    private static String getNewSessionKey() {
        return Constants.SESSION_KEY_PREFIX + PasswordUtils.getUniqueId();
    }
}
