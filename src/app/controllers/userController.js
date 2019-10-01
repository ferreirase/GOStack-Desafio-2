import User from '../models/user';
//usa-se * para importar tudo de dentro do Yup pq ele não tem um export default;
import * as Yup from 'yup';
import { emit } from 'cluster';

class UserController{
  async store(req, res){

    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string().email().required(),
      password: Yup.string().min(6).required()
    });

    if(!(await schema.isValid(req.body))){
      return res.status(400).json({error: 'Validation fails!'})
    }

    const userExists = await User.findOne({where: {email: req.body.email}});
    if(userExists){
      return res.status(400).json({error: 'Email já cadastrado por outro usuário!'});
    }

    const {id, name, email, provider} = await User.create(req.body);
    return res.json({
      id, name, email, provider 
    });
  }

  async update(req, res){
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      oldPassword: Yup.string().min(6), 
      password: Yup.string().min(6).when('oldPassword', (oldPassword, field) => {
        return oldPassword ? field.required() : field;
      }),
      confirmPassword: Yup.string().when('password', (password, field) => {
        return password ? field.required().oneOf([Yup.ref('password')]) : field;
      })
    });

    if(!(await schema.isValid(req.body))){
      return res.status(400).json({error: 'Validation fails!'})
    }
    const {email, oldPassword} = req.body;
    const user = await User.findByPk(req.userID);

    if(email !== user.email){
      const userExists = await User.findOne({where: { email } });
      if(userExists){
        return res.status(400).json({error: 'Email já cadastrado por outro usuário!'});
      }
    }

    if(oldPassword && !(await user.checkPassword(oldPassword))){
      return res.status(401).json({error: 'As senhas não batem!'});
    }

    const {id, name, provider} = await user.update(req.body);

    return res.json({
      id, name, email, provider
    });

  }
}

export default new UserController();