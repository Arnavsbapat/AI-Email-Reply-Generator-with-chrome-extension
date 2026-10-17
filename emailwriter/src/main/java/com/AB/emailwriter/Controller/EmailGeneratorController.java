package com.AB.emailwriter.Controller;


import com.AB.emailwriter.Model.EmailRequest;
import com.AB.emailwriter.Service.EmailGeneratorService;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/email")
@AllArgsConstructor
@CrossOrigin(origins = "*")
public class EmailGeneratorController {

    private EmailGeneratorService emailGeneratorService;

    @PostMapping("/generate")
    public ResponseEntity<String> generateEmail(@RequestBody EmailRequest emailrequest){
        String response = emailGeneratorService.generateEmailReply(emailrequest);
        return (ResponseEntity<String>) ResponseEntity.ok(response);
    }
}
