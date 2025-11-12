package com.harvey.se.service.impl;

import com.baomidou.mybatisplus.core.toolkit.support.SFunction;
import com.baomidou.mybatisplus.extension.conditions.query.LambdaQueryChainWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.harvey.se.dao.UserActionLogMapper;
import com.harvey.se.pojo.dto.UserActionLogDto;
import com.harvey.se.pojo.entity.UserActionLog;
import com.harvey.se.pojo.vo.DateRange;
import com.harvey.se.properties.ConstantsProperties;
import com.harvey.se.service.ServiceUtil;
import com.harvey.se.service.UserActionLogService;
import com.harvey.se.util.ExecutorServiceUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.stream.Collectors;


/**
 * @author <a href="mailto:harvey.blocks@outlook.com">Harvey Blocks</a>
 * @version 1.0
 * @date 2025-11-08 06:56
 * @see UserActionLog
 * @see UserActionLogMapper
 * @see UserActionLogService
 */
@Service
@Slf4j
public class UserActionLogServiceImpl extends ServiceImpl<UserActionLogMapper, UserActionLog> implements
        UserActionLogService {
    private final ExecutorService executorService;

    public UserActionLogServiceImpl(ConstantsProperties constantsProperties) {
        executorService = ExecutorServiceUtil.newFixedThreadPool(
                Integer.parseInt(constantsProperties.getWorkersOnInsertUserAction()),
                "user-action-log-insert-worker-"
        );
    }


    @Override
    public List<UserActionLogDto> longCost(Integer longerThan, Page<UserActionLog> page) {
        return new LambdaQueryChainWrapper<>(baseMapper).ge(UserActionLog::getRequestTimeCost, longerThan)
                .orderByDesc(UserActionLog::getRequestTimeCost, (SFunction<UserActionLog, ?>[]) null)
                .page(page)
                .getRecords()
                .stream()
                .map(UserActionLogDto::adapte)
                .collect(Collectors.toList());
    }

    @Override
    public List<UserActionLogDto> queryByTime(DateRange dateRange, Page<UserActionLog> page) {

        return ServiceUtil.queryAndOrderWithDate(
                        new LambdaQueryChainWrapper<>(this.baseMapper),
                        UserActionLog::getRequestTime,
                        dateRange,
                        page
                )
                .stream()
                .map(UserActionLogDto::adapte)
                .collect(Collectors.toList());
    }

    @Override
    public void syncInsert(UserActionLog userActionLog) {
        executorService.execute(() -> {
            boolean saved = super.save(userActionLog);
            if (!saved) {
                log.warn("保存 {} 失败", userActionLog);
            }
        });
    }


}