import { Body, ConsoleLogger, Controller, Delete, Get, HttpStatus, Param, Post, Put, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApplicationService } from './application.service';
import { Application } from '../schemas/application.schema';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateApplicationDto } from './dto/UpdateApplication.dto';
import { Response } from 'express';
import * as pdf from 'html-pdf';
import { CvData } from '../schemas/cvdata.schema';

@Controller('application')
export class ApplicationController {

constructor(private readonly applicationservice:ApplicationService){}
private readonly logger = new ConsoleLogger(ApplicationController.name);
// @Post()
//     async applyForJob(@Body() applicationData: Application): Promise<Application> {
//         return this.applicationservice.applyForJob(applicationData);
//       }

      @Get()
      async findAll(): Promise<Application[]> {
        return this.applicationservice.findAll();
      }
      @Post()
  @UseInterceptors(FileInterceptor('cv'))
  async applyForJob(@UploadedFile() file: Express.Multer.File, @Body() applicationData: Application): Promise<Application> {
    return this.applicationservice.applyForJob(applicationData, file);
  }
  @Post('upload') // Le chemin de l'endpoint
  @UseInterceptors(FileInterceptor('file')) // 'file' est le nom du champ dans FormData
  async uploadFile(@UploadedFile() file) {
    console.log(file); // Traitez le fichier téléchargé ici
  }
  @Post('/delete-all')
  async deleteAllCandidates(): Promise<string> {
    await this.applicationservice.deleteAllCandidates();
    return 'All candidates deleted successfully';
  }
  @Delete(':id')
  async deleteCandidate(@Param('id') id: string): Promise<void> {
    await this.applicationservice.deleteCandidate(id);
  }
  // @Put(':id')
  // async updateCandidate(@Param('id') id: string, @Body() updateCandidateDto: UpdateApplicationDto) {
  //   return this.applicationservice.updateCandidate(id, updateCandidateDto);
  // }
  @Put(':id')
  updateApplication(@Param('id') id: string, @Body() UpdateApplicationDto: UpdateApplicationDto): Promise<Application> {
    return this.applicationservice.updateCandidate(id, UpdateApplicationDto);
  }
  // @Get('download')
  // async downloadSheet(): Promise<string> {
  //   try {
  //     const csvContent = await this.applicationservice.downloadSheet();
  //     return csvContent;
  //   } catch (error) {
  //     // Gérer les erreurs ici
  //     console.error('Error downloading sheet:', error);
  //     throw error;
  //   }
  // }
  @Get('download')
  async downloadExcel(@Res() res: Response): Promise<void> {
    try {
      const filePath = await this.applicationservice.exportResponsesToExcel();
      res.download(filePath, 'optiflow.xlsx', (err) => {
        if (err) {
          console.error('Error downloading file:', err);
          res.status(500).send('Internal Server Error');
        } else {
          console.log('File downloaded successfully');
        }
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).send('Internal Server Error');
    }
  }
  @Post('generate')
async generateCv(@Body() cvData: CvData, @Res() res): Promise<void> {
try {
const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,
initial-scale=1.0">
<title>CV</title>
<style>
body {
font-family: Arial, sans-serif;
background-color: #f4f4f4;
color: #333;
margin: 0;
padding: 20px;
}
.container {
max-width: 800px;
margin: auto;
background: #fff;
padding: 20px;
border-radius: 5px;
box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
display: flex; /* Utilisation de flexbox pour aligner
les sections */
}
.contact-info {
width: 30%; /* Les coordonnées occupent 30% */
border-right: 1px solid #ccc; /* Ajout d'une bordure
pour séparer */
padding-right: 20px; /* Espacement pour les
coordonnées */
margin-right: 20px; /* Espacement entre les sections
*/
}
  }
  .contact-info h3 {
    margin-top: 0; /* Suppression de la marge pour le
    titre */
    }
    .content {
    flex: 1; /* L'expérience et les compétences occupent
    le reste */
    }
    .education, .skills, .profile {
    margin-top: 20px; /* Espacement entre les sections */
    }
    h1 {
    text-align: center;
    color: #333;
    margin-top: 0; /* Suppression de la marge supérieure
    par défaut */
    }
    p {
    margin-bottom: 10px;
    }
    .education h3, .skills h3 {
    margin-bottom: 10px;
    }
    .skills ul {
    list-style-type: none;
    padding-left: 0;
    }
    .skills li {
    margin-bottom: 5px;
    }
    </style>
    </head>
    <body>
    <h1>CV</h1>
    <div style="margin-bottom: 20px;"></div> <!-- Espace -->
    <div class="container">
    <div class="contact-info">
    <h3>Coordonnées</h3>
    <p>Téléphone: ${cvData.phone1}</p>
    <p>Adresse: ${cvData.Adresse}</p>
    <p>Email: ${cvData.email}</p>
    </div>
    <div class="content">
    <div class="profile">
    <h3>Profile</h3>
    <ul>
    ${cvData.profile}
    </ul>
    </div>
    <hr>
    <div class="education">
    <h3>Éducation</h3>
    <ul>
    ${cvData.educations.split(',').map(education=> `<li>${education.trim()}</li>`).join('')}
    </ul>
    </div>
    <hr>
    <div class="skills">
    <h3>Compétences</h3>
    <ul>
    ${cvData.competences.split(',').map(competence =>
    `<li>${competence.trim()}</li>`).join('')}
    </ul>
    </div>
    </div>
    </div>
    </body>
    </html>
    `;
    pdf.create(htmlContent).toStream((err, stream) => {
    if (err) {
    console.error('Error generating PDF:', err);
    return
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Error generatingPDF');}
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment;filename="cv.pdf"');
      stream.pipe(res);
      });
      } catch (error) {
      console.error('Error generating PDF:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Errorgenerating PDF');
      }
}
}
