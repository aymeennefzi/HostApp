import { Body, Controller, Delete, Get, HttpException, Param, Patch, Post, Query, Sse, UsePipes, ValidationPipe } from '@nestjs/common';
import mongoose from 'mongoose';

import { CreateProjectDto } from './dto/CreateProject.dto';
import { ProjectService } from './project.service';
import { Project, TypeStatutProjet } from './schema/Project.schema';

@Controller('project')
export class ProjectController {
    constructor(private projectService:ProjectService){}
   
    @Post()
    @UsePipes(new ValidationPipe())//enbales validation locally
   createUser(@Body()createuserdto:CreateProjectDto){
    return this. projectService.createProject(createuserdto);
   }
   @Get()
   getUsers(){
    return this. projectService.getProject();
   }
   @Get('/:id')
   async getProjectById(@Param('id') id:string){
   const isValid= mongoose.Types.ObjectId.isValid(id)
   if(!isValid) throw new HttpException('project id is not valid not found',404) 
    const findUser= await this. projectService.getProjectById(id);
    if(!findUser) throw new HttpException('project not found',404)
    return findUser;
   }
   @Patch(':id')
   @UsePipes(new ValidationPipe())
   async updateProject(@Param('id')id:string,@Body()projectdto:CreateProjectDto){
    const isValid= mongoose.Types.ObjectId.isValid(id)
    if(!isValid) throw new HttpException('INVALID id',400) 
    const updatedUser= await this.projectService.updateProject(id,projectdto)
    if(!updatedUser) throw new HttpException('user not found',404)
    return updatedUser;
}
  @Delete(':id')
  async deleteProject(@Param('id') id:string){
  const isValid= mongoose.Types.ObjectId.isValid(id)
  if(!isValid) throw new HttpException('INVALID id',400) 
  const deletedEntreprise=await this.projectService.deleteProject(id)
  }
  @Patch(':id/statut')
  async updateStatut(
    @Param('id') id: string,
    @Body('statut') statut: TypeStatutProjet,
  ): Promise<Project> {
    return this.projectService.updateStatut(id, statut);
  }
 @Post('/by-tasks/jj')
 async getProjectsByTaskIds(@Body('taskIds') taskIds:  string[]) {   
   try {
     const projects = await this.projectService.findProjectsByTaskIds(taskIds);
     return projects;
   } catch (error) {
     throw error;
   }
 }
 @Get('/newP/new-this-month')
 async getNewProjectsThisMonth(): Promise<{ newProjects: number }> {
   const newProjects = await this.projectService.getNewProjectsThisMonth();
   return { newProjects };
 }


 @Get('FinishedP/finished-this-month')
  async getFinishedProjectsThisMonth(): Promise<{ finishedProjects: number }> {
    const finishedProjects = await this.projectService.getFinishedProjectsThisMonth();
    return { finishedProjects };
  }

  @Get('Project/current-month')
  async getProjectsForCurrentMonth(): Promise<{ name: string, progress: TypeStatutProjet, duration: number }[]> {
    return await this.projectService.getProjectsForCurrentMonth();
  }
  @Get('Status/project-count-by-status')
  async getProjectsCountByStatus(): Promise<{ [key in TypeStatutProjet]: number }> {
    return await this.projectService.getProjectsCountByStatus();
  }

}