import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterSalonDto } from "./dto/register-salon.dto";
import { RegisterFreelanceDto } from "./dto/register-freelance.dto";
import { LoginDto } from "./dto/login.dto";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("register/salon")
  registerSalon(@Body() dto: RegisterSalonDto) {
    return this.authService.registerSalon(dto);
  }

  @Post("register/freelance")
  registerFreelance(@Body() dto: RegisterFreelanceDto) {
    return this.authService.registerFreelance(dto);
  }

  @Post("login")
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
