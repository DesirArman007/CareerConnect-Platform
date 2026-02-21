const isProduction = process.env.NODE_ENV === "production";

const baseCookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    partitioned: isProduction // Required for CHIPS (Cross-site cookies in modern browsers)
};

const accessTokenCookieOptions = {
    ...baseCookieOptions,
    maxAge: process.env.ACCESS_COOKIE_MAX_AGE || 15 * 60 * 1000 // 15 mins default
};

const refreshTokenCookieOptions = {
    ...baseCookieOptions,
    maxAge: process.env.REFRESH_TOKEN_COOKIE_MAX_AGE || 7 * 24 * 60 * 60 * 1000 // 7 days default
};

export const setAuthCookies = (res, accessToken, refreshToken) => {
    res.cookie("accessToken", accessToken, accessTokenCookieOptions);
    res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions);
};

export const clearAuthCookies = (res) => {
    res.clearCookie("accessToken", accessTokenCookieOptions);
    res.clearCookie("refreshToken", refreshTokenCookieOptions);
};