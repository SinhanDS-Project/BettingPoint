package com.bettopia.game.controller;

import com.bettopia.game.model.multi.turtle.TurtlePlayerDTO;
import com.bettopia.game.model.multi.turtle.PlayerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/player")
public class PlayerRestController {

    @Autowired
    private PlayerService playerService;

    // 전체 게임방 플레이어 수 조회
    @GetMapping("/count")
    public Map<String, Integer> getAllCounts() {
        return playerService.getAllPlayers();
    }

    // 게임방 플레이어 상세 조회
    @GetMapping("/detail/{roomId}")
    public List<TurtlePlayerDTO> getPlayers(@PathVariable String roomId) {
        return playerService.getPlayers(roomId);
    }
}
