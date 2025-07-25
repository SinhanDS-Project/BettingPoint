package com.bettopia.game.model.history;

import com.bettopia.game.model.auth.AuthService;
import com.bettopia.game.model.auth.UserVO;
import org.apache.ibatis.session.SqlSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Repository
public class HistoryDAO {

    @Autowired
    private SqlSession sqlSession;

    String namespace = "com.bpoint.history.";
    @Autowired
    private AuthService authService;

    public List<GameHistoryDTO> gameHistoryList(String userId) {
        return sqlSession.selectList(namespace + "selectGameHistoryAll", userId);
    }

    public List<PointHistoryDTO> pointHistoryList(String userId) {
        return sqlSession.selectList(namespace + "selectPointHistoryAll", userId);
    }
    
	public int countGameHistory(String userId) {
		return sqlSession.selectOne(namespace + "countGameHistory", userId);
	}
	
	public int countPointHistory(String userId) {
		return sqlSession.selectOne(namespace + "countPointHistory", userId);
	}
	
	
	public GameHistoryDTO selectGameHistoryByUid(String ghUid) {
	    return sqlSession.selectOne(namespace + "selectGameHistoryByUid", ghUid);
	}

	
    public List<GameHistoryDTO> gameHistoryList(String userId, int offset, int size) {
        Map<String, Object> params = new HashMap<>();
        params.put("offset", offset);
        params.put("size", size);
        params.put("userId", userId);
        return sqlSession.selectList(namespace + "gameAllWithPaging", params);
    }

    public List<PointHistoryDTO> pointHistoryList(String userId, int offset, int size) {
        Map<String, Object> params = new HashMap<>();
        params.put("offset", offset);
        params.put("size", size);
        params.put("userId", userId);
        return sqlSession.selectList(namespace + "pointAllWithPaging", params);
    }

    public GameHistoryDTO insertGameHistory(GameHistoryDTO gameHistory, String userId) {
        String uid = UUID.randomUUID().toString().replace("-", "");
        GameHistoryDTO history = GameHistoryDTO.builder()
                .uid(uid)
                .user_uid(userId)
                .game_uid(gameHistory.getGame_uid())
                .betting_amount(gameHistory.getBetting_amount())
                .point_value(gameHistory.getPoint_value())
                .game_result(gameHistory.getGame_result())
                .build();
        
        history.setGame_name(gameHistory.getGame_name());

        sqlSession.insert(namespace + "insertGameHistory", history);
        return history;
    }

    public String insertPointHistory(PointHistoryDTO pointHistory, String userId) {
        String uid = UUID.randomUUID().toString().replace("-", "");
        PointHistoryDTO history = PointHistoryDTO.builder()
                .uid(uid)
                .user_uid(userId)
                .gh_uid(pointHistory.getGh_uid())
                .type(pointHistory.getType())
                .amount(pointHistory.getAmount())
                .balance_after(pointHistory.getBalance_after())
                .build();
        sqlSession.insert(namespace + "insertPointHistory", history);
        return uid;
    }

    public String insertPointHistory(String userId, int amount) {
        String uid = UUID.randomUUID().toString().replace("-", "");
        int balance = authService.findByUid(userId).getPoint_balance();

        PointHistoryDTO history = PointHistoryDTO.builder()
                .uid(uid)
                .user_uid(userId)
                .amount(amount)
                .balance_after(balance)
                .build();
        sqlSession.insert(namespace + "chargePoint", history);
        return uid;
    }
}
