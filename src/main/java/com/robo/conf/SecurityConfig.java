package com.robo.conf;

import com.robo.Entities.User;
import com.robo.repository.UserDetailsRepo;
import org.springframework.boot.autoconfigure.security.oauth2.client.EnableOAuth2Sso;
import org.springframework.boot.autoconfigure.security.oauth2.resource.PrincipalExtractor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.builders.WebSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.time.LocalDateTime;

@Configuration
@EnableWebSecurity
@EnableOAuth2Sso
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http
            .antMatcher("/**")
            .authorizeRequests()
            .antMatchers("/",
                    "/login**",
                    "/js/**",
                    "/img/**",
                    "/css/**",
                    "/error**").permitAll()

            .anyRequest()
                .authenticated()

            .and()
                .logout()
                .deleteCookies("JSESSIONID")
                .logoutSuccessUrl("/")
                .permitAll()

            .and()
                .csrf()
                .disable();
//        http.authorizeRequests().antMatchers("/**").permitAll().and().csrf().disable();

    }

    @Override
    public void configure(WebSecurity web) {
        web.ignoring().antMatchers("/css/**", "/js/**", "/static/**", "/webjars/**");
    }

    @Bean
    public PrincipalExtractor principalExtractor(UserDetailsRepo userDetailsRepo) {

        return map -> {
            String id = (String) map.get("sub");

//            User user = userDetailsRepo.findById(id).orElseGet(() -> new User(
//                    id,
//                    (String) map.get("name"),
//                    (String) map.get("picture"),
//                    (String) map.get("email"))
//            );

            User user = userDetailsRepo.findById(id).orElseThrow(() -> new UsernameNotFoundException("User not found."));

            user.setLastVisit(LocalDateTime.now());
            return userDetailsRepo.save(user);
        };
    }

}

