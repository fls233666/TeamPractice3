package com.harvey.se.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.harvey.se.pojo.dto.UserActionLogDto;
import com.harvey.se.pojo.entity.UserActionLog;
import com.harvey.se.pojo.vo.DateRange;

import java.util.List;

/**
 * @author <a href="mailto:harvey.blocks@outlook.com">Harvey Blocks</a>
 * @version 1.0
 * @date 2025-11-08 06:52
 */
public interface UserActionLogService extends IService<UserActionLog> {
    /**
     * 在服务器消费耗费长的操作, 从花费长到花费短
     */
    List<UserActionLogDto> longCost(Integer longerThan, Page<UserActionLog> page);

    /**
     * 依据请求发送的时间查询
     */
    List<UserActionLogDto> queryByTime(DateRange dateRange, Page<UserActionLog> page);


    void syncInsert(UserActionLog userActionLog);
}
