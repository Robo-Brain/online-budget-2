package com.robo.service;

import com.robo.Entities.MonthlySpends;
import com.robo.Entities.Notices;
import com.robo.exceptions.NotFoundException;
import com.robo.repository.MonthlySpendsRepo;
import com.robo.repository.NoticesRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class NoticesService {

    @Autowired
    MonthlySpendsRepo msr;

    @Autowired
    NoticesRepo nr;

    @Autowired
    MonthlySpendsService mss;

    public void addNotice(Integer monthlySpendId, String text, Boolean remind) {
        if (text.length() > 2) {
            Integer msID = msr.findOneById(monthlySpendId).isPresent() ? monthlySpendId : null; // проверить есть ли в monthly_spends поле с таким ID, если нет, то заnullить его
            Notices notice = new Notices();
            notice.setMonthlySpendId(msID);
            notice.setText(text);
            notice.setRemind(remind);
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

}
