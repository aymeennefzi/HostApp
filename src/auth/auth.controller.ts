import {  Body, Controller, Get, HttpException, NotFoundException, Param, Patch, Post, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import { signupDto } from './dto/signupDto';
import { loginDto } from './dto/login.dto';
import { User } from './Shemas/User.shema';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { UpdateProfileDto } from './dto/UpdateProfileDto';
import { UpdatePasswordDto } from './dto/UpdatePasswordDto';
import { ResetPasswordDto } from './dto/ResetPasswordDto';
import { Role } from './Shemas/Roles.Shema';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import mongoose from 'mongoose';

@Controller('auth')
export class AuthController {
    constructor(private authservice:AuthService , @InjectModel(User.name)
    private userMosel:Model<User>){}

  @Post('signup')
    async signUp(@Body() signupDto: signupDto): Promise<{ token: string }> {
    return await this.authservice.signUp(signupDto);
  }
  @Post('/login')
  async login(@Body() logindto: loginDto): Promise<{ token: string; expiresIn: number; user: { role: Role; id: string; firstname: string  , lastname : string} }> {
    return this.authservice.login(logindto);
  }


  @Get('/findrole')
  async findWithRole(@Body('id') id: string): Promise<User> {
    return this.authservice.findByIdWithRole(id);
  }

  @Get('/finduser/:id')
  async findUserById(@Param('id') id: string): Promise<User> {
    return this.authservice.findById(id);
  }


  @Post('/activate')
  // @Roles('admin')
  // @UseGuards(RolesGuard)
  async activateUser(@Body('userId') userId: string): Promise<User> {
    try {
      const user = await this.authservice.activateUser(userId);
      return user;
    } catch (error) {
      throw new Error("Une erreur s'est produite lors de l'activation de l'utilisateur.");
    }
  }
  @Post('/deactivate')
  // @Roles('admin')
  // @UseGuards(RolesGuard)
  async deactivateUser(@Body('userId') userId:string):Promise<User>{
    try{
      const user=await this.authservice.deactivateUser(userId);
      return user;
    }
    catch(error){
      throw new Error("une erreur s' est produite lors de la deseactivation de compte")
    }
  }
  @Post('/logout')
  @UseGuards(AuthGuard())
  async logout(@Res({ passthrough: true }) res: Response): Promise<void> {
    console.log(res.cookie);
    res.clearCookie('user_token');
  }

  // @Patch('updateProfile/:id')
  // async updateUser(@Param('id') userId: string, @Body() updateDto: UpdateProfileDto): Promise<User> {
  //   return this.authservice.updateUser(userId, updateDto);
  // }
  @Patch('/update-password')
  @UseGuards(AuthGuard())
  async updatePassword(@Req() req: Request, @Body() updatePasswordDto: UpdatePasswordDto): Promise<void> {
    const { user } = req as any;
    await this.authservice.updatePassword(user.id, updatePasswordDto);
  }

  @Post('/forgot-password')
  // @UseGuards(AuthGuard())
  async forgotPassword(@Body('email') email : string): Promise<User> {
    const user = await this.authservice.sendPinCode(email);
    return user ;
  }
  @Post('/reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<void> {
    const { newPassword, pinCode } = resetPasswordDto;
    await this.authservice.resetPassword(newPassword, pinCode);
  }

  @Get('isemailvalid')
  async  isEmailValid(@Body('email') email:string):Promise<boolean>
  {
    return this.isEmailValid(email);
  }
  @Get('allusers')
  async getAllUsers(): Promise<User[]> {
    return this.authservice.getAllUsers();
  }
  
  @Get('/allusers')
  async getuserbyid(): Promise<User[]>{
    return await this.authservice.getusers1();
  }


@Get('pictures/:filename') 
async getPicture(@Param ('filename') filename , @Res() res){
  res.sendFile(filename , {root : './uploads'});
}

@Post('uploadImage/:userId')
@UseInterceptors(FileInterceptor('file', {
  storage: diskStorage({
    destination: './uploads',
    filename: (req, file, cb) => {
      const name = file.originalname.split('.')[0];
      const fileExtension = file.originalname.split('.')[1];
      const newFileName = name.split("").join('-') + '-' + Date.now() + '.' + fileExtension;
      cb(null, newFileName);
    }
  }),
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|png|gif)$/)) {
      return cb(null, false);
    }
    cb(null, true);
  }
}))
async uploadPhoto1(@UploadedFile() file: Express.Multer.File, @Param('userId') userId: string) {
  const user = await this.userMosel.findById(userId);
  if (!user) {
    throw new NotFoundException('User not found');
  }
  const filePath = 'http://localhost:3000/auth/pictures/' + file.filename;
  user.profileImage = filePath;
  
  return user.save();
}

@Post('user-by-task/ahmed')
async getUserByTaskId(@Body('taskId') taskId: string) {
  // Appel au service pour obtenir l'utilisateur en fonction de l'ID de la tâche
  return await this.authservice.findUserByTaskId(taskId);
}

@Get('/:id/ahmed')
async getUserById(@Param('id') id:string){
const isValid= mongoose.Types.ObjectId.isValid(id)
if(!isValid) throw new HttpException('task id not found',404)
 const findUser= await this. authservice.getUserById(id);
 if(!findUser) throw new HttpException('task not found',404)
 return findUser;
}

@Get('/email/:email')
async findByEmail(@Param('email') email: string) {
  try {
    const user = await this.authservice.findByEmail(email);
    return user;
  } catch (error) {
    throw new NotFoundException(error.message);
  }
}

  @Get('Costumer/NewClient') // Changement du chemin pour éviter les conflits
    async getNewCustomersThisMonth(): Promise<{ newCustomers: number }> {
        const newCustomers = await this.authservice.getNewCustomersThisMonth();
        return { newCustomers };
    }

    @Get('userbytoken/:token') // Définir le paramètre token dans l'URL
  async getUserByToken(@Param('token') token: string): Promise<User> {
    const user = await this.authservice.getUserByToken(token);
    return user;
  } 
    

    @Get('Employee/NewEmloyee') // Changement du chemin pour éviter les conflits
    async getNewEmplosThisMonth(): Promise<{ newEmployees: number }> {
        const newEmployees = await this.authservice.getNewEmployyesThisMonth();
        return { newEmployees };
    }
    @Patch('updateProfile/:id')

async updateUser(@Param('id') userId: string, @Body() updateDto: UpdateProfileDto): Promise<User> {
     let updatedUser: User;
      updatedUser = await this.authservice.updateUser1(userId, updateDto);
    return updatedUser;
}

}