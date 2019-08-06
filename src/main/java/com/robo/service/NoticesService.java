package com.robo.service;

import com.robo.Entities.MonthlySpends;
import com.robo.Entities.Notices;
import com.robo.exceptions.NotFoundException;
import com.robo.repository.MonthlySpendsRepo;
import com.robo.repository.NoticesRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
            Integer msId = msr.findOneById(monthlySpendId).isPresent() ? monthlySpendId : null; // проверить есть ли в monthly_spends поле с таким ID, если нет, то заnullить его
            Notices notice = new Notices();
            notice.setMonthlySpendId(msId);
            notice.setText(text);
            notice.setRemind(remind);
            notice.setCreationDate(LocalDate.now());
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

    public List<Map<String, String>> getAllReminds() {
        List<Notices> noticesList = nr.findAllByRemind(true);
        List<Map<String, String>> result = new ArrayList<>();
        if (!noticesList.isEmpty()){
            noticesList.forEach(remind -> {
                Map<String, String> tmpMap = new HashMap<>();
                MonthlySpends ms = msr.findOneById(remind.getMonthlySpendId()).orElseThrow(NotFoundException::new);
                tmpMap.put("id", remind.getId().toString());
                tmpMap.put("text", remind.getText());
                tmpMap.put("spendName", ms.getTemplates().getSpends().getName());
                tmpMap.put("date", ms.getDates().getDate().toString());
                tmpMap.put("creationDate", remind.getCreationDate().toString());
                result.add(tmpMap);
            });
        }
        return result;
    }

}
