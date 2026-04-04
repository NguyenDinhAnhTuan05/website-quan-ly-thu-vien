package com.nhom10.library.security.oauth2.userinfo;

import java.util.Map;

/**
 * Abstract base — định nghĩa interface chung cho mọi OAuth2 provider.
 * Mỗi provider trả về attributes với tên field khác nhau,
 * abstract class này chuẩn hóa về 3 field cần thiết: id, email, name, avatarUrl.
 *
 * Pattern: Template Method — subclass implement các getter cụ thể.
 */
public abstract class OAuth2UserInfo {

    protected final Map<String, Object> attributes;

    protected OAuth2UserInfo(Map<String, Object> attributes) {
        this.attributes = attributes;
    }

    public Map<String, Object> getAttributes() {
        return attributes;
    }

    /** ID của user trên hệ thống provider (Google sub, GitHub id...) */
    public abstract String getId();

    /** Tên hiển thị */
    public abstract String getName();

    /** Email — dùng làm identifier trong hệ thống */
    public abstract String getEmail();

    /** URL ảnh đại diện */
    public abstract String getAvatarUrl();
}
