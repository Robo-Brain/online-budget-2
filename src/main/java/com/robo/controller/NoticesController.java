package com.robo.controller;

import com.robo.Entities.Notices;
import com.robo.repository.NoticesRepo;
import com.robo.service.NoticesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("notices")
public class NoticesController {

    @Autowired
    NoticesService ns;

    @Autowired
    NoticesRepo nr;

    @GetMapping
    public List<Notices> getAllNotices() {
        return nr.findAll();
    }

    @GetMapping("/reminds")
    public List<Notices> getAllReminds() {
        return nr.findAllByRemind(true);
    }

    @PutMapping("/add")
    public void addNotice(@RequestParam(name = "monthlySpendId") Integer monthlySpendId, @RequestParam(name = "text") String text, @RequestParam(name = "remind") Boolean remind) {
        ns.addNotice(monthlySpendId, text, remind);
    }

    @DeleteMapping("{noticeId}")
    public List<Notices> deleteNoticeByNoticeId(@PathVariable Integer noticeId){
        return ns.deleteNoticeByNoticeId(noticeId);
    }

    @GetMapping("{monthlySpendId}")
    public List<Notices> findNoticeByMonthlySpendId(@PathVariable Integer monthlySpendId) {
        return nr.findAllByMonthlySpendId(monthlySpendId);
    }

    @PostMapping("/muteNotice/{noticeId}")
    public List<Notices> muteNotice(@PathVariable Integer noticeId) {
        return ns.muteNotice(noticeId);
    }

}
