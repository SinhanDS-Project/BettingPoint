package com.bettopia.game.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/support")
public class SupportController {
	@GetMapping("")
	public String goSupportPage() {
		return "/support/index";
	}
	
	// FAQ's 불러오기
	@GetMapping("/faq")
	public String supportFAQ() {
		return "/support/faq";
	}
	
	// 공지사항 불러오기
	@GetMapping("/notice")
	public String supportNotice() {
		return "/support/notice";
	}
	
	// 공지사항 상세 불러오기
	@GetMapping("/view")
	public String supportView() {
		return "support/view";
	}

	// 1대1문의 불러오기
	@GetMapping("/inquiry")
	public String supportInquiry() {
		return "support/inquiry";
	}
}
