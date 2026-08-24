package dev.enzosantos.timesheet.infrastructure.web.controllers;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import dev.enzosantos.timesheet.application.usecases.HolidayLoader;
import dev.enzosantos.timesheet.application.usecases.HolidaySynchronizer;
import dev.enzosantos.timesheet.infrastructure.web.dto.HolidayDTO;
import dev.enzosantos.timesheet.infrastructure.web.mapper.HolidayDTOMapper;

@RestController
@CrossOrigin
@RequestMapping("/holidays")
class HolidayController {

    private final HolidayLoader loader;
    private final HolidaySynchronizer synchronizer;

    public HolidayController(HolidayLoader loader, HolidaySynchronizer synchronizer) {
        this.loader = loader;
        this.synchronizer = synchronizer;
    }

    @GetMapping("/{year}/{month}")
    List<HolidayDTO> get(
            @PathVariable int year,
            @PathVariable int month) {
        return loader.execute(year, month).stream().map(HolidayDTOMapper::toDTO).toList();
    }

    @PostMapping("/sync")
    void sync(@RequestParam int year) {
        synchronizer.execute(year);
    }
}
