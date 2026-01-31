const baseCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict"
};

const accessTokenCookieOptions = {
    ...baseCookieOptions,
    maxAge: process.env.ACCESS_COOKIE_MAX_AGE
};

const refreshTokenCookieOptions = {
    ...baseCookieOptions,
    maxAge: process.env.REFRESH_TOKEN_COOKIE_MAX_AGE
};

export const setAuthCookies = (res, accessToken, refreshToken) => {
    res.cookie("accessToken", accessToken, accessTokenCookieOptions);
    res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions);
};

export const clearAuthCookies = (res) => {
    res.clearCookie("accessToken", accessTokenCookieOptions);
    res.clearCookie("refreshToken", refreshTokenCookieOptions);
};