package com.robo.controller;

import com.robo.Entities.Spends;
import com.robo.repository.SpendsRepo;
import com.robo.service.SpendsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("spends")
public class SpendsController {

    @Autowired
    SpendsRepo sr;

    @Autowired
    SpendsService ss;

    @GetMapping
    public List<Spends> getAllSpends() {
        return sr.findAll();
    }

    @GetMapping("{id}")
    public List<Spends> getMissingSpends(@PathVariable Integer id) { // принимает id как TemplatesList id, находит его в базе и получает разностный массив между spendsId в templates_list и id в таблице spends
        return ss.getMissingSpends(id);
    }

    @PutMapping("{name}")
    @ResponseBody
    public List<Spends> addSpend(@PathVariable String name) {
        sr.save(new Spends(name));
        return getAllSpends();
    }

    @PostMapping("/editSpendWithName")
    @ResponseBody
    public void editSpend(@RequestParam Map<String,String> requestParams) { ss.editSpend(requestParams); }

}
