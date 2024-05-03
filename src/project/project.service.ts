import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/auth/Shemas/User.shema';
import { CreateProjectDto } from './dto/CreateProject.dto';
import { Project, TypeStatutProjet } from './schema/Project.schema';
import { Tasks } from './schema/Tasks.schema';

@Injectable()
export class ProjectService {
    constructor(@InjectModel(Project.name) private projectModel:Model<Project>,@InjectModel(Tasks.name) private taskModel:Model<Tasks>,
    @InjectModel(User.name) private userModel:Model<User>){}
    async createProject({ UserProjectsId, ...Pdto }:CreateProjectDto){
      if (UserProjectsId) {
        const findE= await this.userModel.findById(UserProjectsId);
        if (!findE) throw new HttpException(" u not found", 400);
      }
      const newP = new this.projectModel( Pdto);
      const savedP = await newP.save();
      if (UserProjectsId) {
        await this.userModel.updateOne({ _id:UserProjectsId  }, {  $push: { projects: savedP._id}});
      }
    
      return savedP;
}

    async getProject():Promise<Project[]>{
        
       let projects= await  this.projectModel.find().populate(['tasks']);
       return projects;
    }
    getProjectById(id:string){
        return this.projectModel.findById(id).populate(['tasks']);
    }
    updateProject(id:string,projectdto:CreateProjectDto){
      return  this.projectModel.findByIdAndUpdate(id,projectdto,{new:true})
    }
    async deleteProject(id:string){
       
    const del= await this.projectModel.findByIdAndDelete(id);
   if (!del) {
    // Handle the case where the PROJECT does not exist.
    return null;
  }
        await this.taskModel.deleteOne({},{ projectId: id});
        await this.userModel.updateMany(
          {}, // This empty filter matches all documents in the collection.
          { $pull: { projects: del._id } } // Pull the deleted task's ID from the tasks array.
        );
     return { message: 'PROJECT deleted and references removed' };
      }
      async updateStatut(id: string, statut: TypeStatutProjet): Promise<Project> {
        const updatedProject = await this.projectModel.findByIdAndUpdate(
          id,
          { statut },
          { new: true }
        );
        return updatedProject;
      }
      async findProjectsByTaskIds(taskIds: string[]): Promise<Project[]> {
        // Ensure taskIds is not null or empty
        if (!taskIds || taskIds.length === 0) {
            throw new NotFoundException('No task IDs provided');
        }
    
        const projects = await this.projectModel.find({ tasks: { "$in": taskIds } }).exec();
        if (!projects.length) {
            throw new NotFoundException('Project with the given task IDs not found');
        }
        return projects;
    }
    async getNewProjectsThisMonth(): Promise<number> {
      // Récupérer la date du premier jour du mois en cours
      const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      
      // Récupérer la date du dernier jour du mois en cours
      const lastDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
  
      // Récupérer tous les nouveaux projets créés ce mois-ci
      const newProjects = await this.projectModel.find({
        createdAt: {
          $gte: firstDayOfMonth,
          $lte: lastDayOfMonth,
        },
      }).exec();
  
      // Retourner le nombre de nouveaux projets ce mois-ci
      return newProjects.length;
    }


    async getFinishedProjectsThisMonth(): Promise<number> {
      const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const lastDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
  
      return await this.projectModel.countDocuments({
        statut: TypeStatutProjet.FINISHED,
        FinishDate: {
          $gte: firstDayOfMonth,
          $lte: lastDayOfMonth
        }
      });
    }


    async getProjectsForCurrentMonth(): Promise<{ name: string, progress: TypeStatutProjet, duration: number }[]> {
      const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const lastDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
  
      const projects = await this.projectModel.find({
        StartDate: { $lte: lastDayOfMonth },
        FinishDate: { $gte: firstDayOfMonth }
      }).select('NomProject statut StartDate FinishDate');
  
      return projects.map(project => ({
        name: project.NomProject,
        progress: project.progress,
        duration: (new Date(project.FinishDate).getTime() - new Date(project.StartDate).getTime()) / (1000 * 3600 * 24)
      }));
    }


    async getProjectsCountByStatus(): Promise<{ [key in TypeStatutProjet]: number }> {
      const projectCounts = await this.projectModel.aggregate([
        {
          $group: {
            _id: '$statut',
            count: { $sum: 1 }
          }
        }
      ]);
  
      const projectCountMap: { [key in TypeStatutProjet]: number } = {
        [TypeStatutProjet.New]: 0,
        [TypeStatutProjet.RUNNING]: 0,
        [TypeStatutProjet.FINISHED]: 0,
      };
  
      projectCounts.forEach((item: any) => {
        projectCountMap[item._id] = item.count;
      });
  
      return projectCountMap;
    }


    
}
