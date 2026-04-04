package com.nhom10.library.security.oauth2.userinfo;

import java.util.Map;

/**
 * Google OAuth2 attributes:
 *  - sub:     unique identifier
 *  - name:    full name
 *  - email:   email address
 *  - picture: avatar URL
 */
public class GoogleOAuth2UserInfo extends OAuth2UserInfo {

    public GoogleOAuth2UserInfo(Map<String, Object> attributes) {
        super(attributes);
    }

    @Override
    public String getId() {
        return (String) attributes.get("sub");
    }

    @Override
    public String getName() {
        return (String) attributes.get("name");
    }

    @Override
    public String getEmail() {
        return (String) attributes.get("email");
    }

    @Override
    public String getAvatarUrl() {
        return (String) attributes.get("picture");
    }
}
