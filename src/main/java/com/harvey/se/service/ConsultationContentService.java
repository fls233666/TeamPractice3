package com.harvey.se.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.harvey.se.pojo.dto.ConsultationContentDto;
import com.harvey.se.pojo.dto.ConsultationContentWithUserEntityDto;
import com.harvey.se.pojo.entity.ConsultationContent;
import com.harvey.se.pojo.entity.User;

import java.util.List;

/**
 * @author <a href="mailto:harvey.blocks@outlook.com">Harvey Blocks</a>
 * @version 1.0
 * @date 2025-11-08 06:51
 */
public interface ConsultationContentService extends IService<ConsultationContent> {

    ConsultationContentDto queryByUser(Long userId);

    List<ConsultationContentDto> queryByPage(Page<ConsultationContent> page);

    List<ConsultationContentWithUserEntityDto> combineWithUsers(List<User> userList);

    ConsultationContentDto upsert(Long aLong, ConsultationContentDto consultationContentDto);
}
