package com.nhom10.library.event;

import com.nhom10.library.entity.User;
import com.nhom10.library.entity.enums.PointActionType;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class GamificationEvent extends ApplicationEvent {
    private final User user;
    private final PointActionType actionType;
    private final String referenceId;
    private final String description;

    public GamificationEvent(Object source, User user, PointActionType actionType, String referenceId, String description) {
        super(source);
        this.user = user;
        this.actionType = actionType;
        this.referenceId = referenceId;
        this.description = description;
    }
}
