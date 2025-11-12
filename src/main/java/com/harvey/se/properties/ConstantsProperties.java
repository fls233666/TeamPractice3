package com.harvey.se.properties;

import com.harvey.se.util.ServerConstants;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * @author <a href="mailto:harvey.blocks@outlook.com">Harvey Blocks</a>
 * @version 1.0
 * @date 2024-02-04 17:28
 */
@Data
@ConfigurationProperties(prefix = "h-se.constants")
public class ConstantsProperties {
    private String authorizationHeader = ServerConstants.AUTHORIZATION_HEADER;
    private String restrictRequestTimes = ServerConstants.RESTRICT_REQUEST_TIMES;
    private String clearClickHistoryWaitSeconds = String.valueOf(ServerConstants.CLEAR_CLICK_HISTORY_WAIT_MILLIONS);
    private String maxPageSize = ServerConstants.MAX_PAGE_SIZE;
    private String defaultPageSize = ServerConstants.DEFAULT_PAGE_SIZE;
    private String workersOnInsertUserAction = String.valueOf(ServerConstants.WORKERS_ON_INSERT_USER_ACTION);
    private String redisHost;
    private String redisPassword;
}
