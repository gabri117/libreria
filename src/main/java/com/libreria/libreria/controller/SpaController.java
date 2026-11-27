package com.libreria.libreria.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SpaController {

    @RequestMapping(value = {
            "/login",
            "/ventas",
            "/caja",
            "/pos",
            "/inventario",
            "/compras",
            "/ajustes",
            "/clientes",
            "/catalogos",
            "/usuarios"
    })
    public String forwardToIndex() {
        return "forward:/index.html";
    }
}
