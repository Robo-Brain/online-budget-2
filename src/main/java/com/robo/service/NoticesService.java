package com.robo.service;

import com.robo.DTOModel.NoticesDTO;
import com.robo.Entities.MonthlySpends;
import com.robo.Entities.Notices;
import com.robo.exceptions.NotFoundException;
import com.robo.repository.MonthlySpendsRepo;
import com.robo.repository.NoticesRepo;
import com.robo.repository.SpendsRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.Date;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NoticesService {

    @Autowired
    MonthlySpendsRepo msr;

    @Autowired
    NoticesRepo nr;

    @Autowired
    SpendsRepo sr;

    @Autowired
    MonthlySpendsService mss;

    public void addNotice(Integer monthlySpendId, String text, Boolean remind) {
        if (text.length() > 2) {
            MonthlySpends ms = msr.findOneById(monthlySpendId).orElseThrow(NotFoundException::new);
            Notices notice = new Notices();
            notice.setMonthlySpendId(ms.getId());
            notice.setText(text);
            notice.setRemind(remind);
            notice.setCreationDate(Date.valueOf(LocalDate.now()));
            notice.setSpendId(ms.getTemplates().getSpendId());
            nr.save(notice);
        }
    }

    public List<Notices> deleteNoticeByNoticeId(Integer noticeId) {
        Notices notices = nr.findById(noticeId).orElseThrow(NotFoundException::new);
        Integer monthlySpendId = notices.getMonthlySpendId();
        nr.delete(notices);
        return nr.findAllByMonthlySpendId(monthlySpendId);
    }

    public List<Notices> muteNotice(Integer noticeId) {
        Notices notices = nr.findById(noticeId).orElseThrow(NotFoundException::new);
        notices.setRemind(false);
        nr.save(notices);
        return nr.findAllByMonthlySpendId(notices.getMonthlySpendId());
    }

    public List<Notices> getNoticesByDateId(Integer dateId){
        List<MonthlySpends> msList = mss.getMonthlySpendsByDateId(dateId);
        List<Notices> result = new ArrayList<>();
        msList.forEach(ms -> result.addAll(nr.findAllByMonthlySpendId(ms.getId())));
        return result;
    }

    Integer getNoticeCountForDateId(Integer dateId){
        List<MonthlySpends> msList = mss.getMonthlySpendsByDateId(dateId);
        Long notesQuantity = 0L;
        if (!msList.isEmpty()){
            notesQuantity = msList.stream().map(ms -> nr.findAllByMonthlySpendId(ms.getId())).count();
        }
        return (int) (long) notesQuantity;
    }

    public List<Integer> getAllDateIdsWhereHasNotices() {
        List<Notices> noticesList = nr.findAll();
        List<Integer> result = new ArrayList<>();
        if(!noticesList.isEmpty()){
            noticesList.forEach(notice -> msr.findById(notice.getMonthlySpendId())
                    .ifPresent(monthlySpends -> result.add(monthlySpends.getDateId())));
        }
        return result;
    }

    public List<NoticesDTO> getAllReminds() {
        List<Notices> noticesList = nr.findAllByRemind(true);
        List<NoticesDTO> result = new ArrayList<>();
        if (!noticesList.isEmpty()){
            noticesList.forEach(notice -> {
                MonthlySpends ms = msr.findOneById(notice.getMonthlySpendId()).orElseThrow(NotFoundException::new);

                NoticesDTO noticesDTO = new NoticesDTO();
                noticesDTO.setNoticeId(notice.getId());
                noticesDTO.setText(notice.getText());
                noticesDTO.setSpendName(ms.getTemplates().getSpends().getName());
                noticesDTO.setCreationDate(notice.getCreationDate());
                noticesDTO.setDate(ms.getDates().getDate());
                result.add(noticesDTO);
            });
        }
        return result;
    }

    public List<NoticesDTO> getMissingNotes() {
        List<Notices> allNotices = nr.findAll();
        List<Notices> noticesList = allNotices.stream().filter(notice -> !msr.findOneById(notice.getMonthlySpendId()).isPresent()).collect(Collectors.toList());

        List<NoticesDTO> result = new ArrayList<>();
        noticesList.forEach(notice -> {
            NoticesDTO noticesDTO = new NoticesDTO();
            noticesDTO.setNoticeId(notice.getId());
            noticesDTO.setText(notice.getText());
            noticesDTO.setSpendName(sr.findOneById(notice.getSpendId()).getName());
            noticesDTO.setCreationDate(notice.getCreationDate());

            result.add(noticesDTO);
        });
        return result;
    }
}
