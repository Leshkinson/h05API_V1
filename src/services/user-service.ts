import bcrypt from "bcrypt";
import {IUser} from "../ts/interfaces";
import {RefType, SortOrder} from "mongoose";
import {UsersRepository} from "../repositories/users-repository";


export class UserService {
    private userRepository: UsersRepository;

    constructor() {
        this.userRepository = new UsersRepository()
    }

    public async getAll(
        sortBy: string = 'createdAt',
        sortDirection: SortOrder | undefined = 'desc',
        pageNumber: number = 1,
        pageSize: number = 10,
        searchLoginTerm: { login: { $regex: RegExp } } | {} = {},
        searchEmailTerm: { email: { $regex: RegExp } } | {} = {}
    ): Promise<IUser[]> {
        if (searchLoginTerm) searchLoginTerm = {name: {$regex: new RegExp(`.*${searchLoginTerm}.*`, 'i')}};
        if (searchEmailTerm) searchEmailTerm = {name: {$regex: new RegExp(`.*${searchEmailTerm}.*`, 'i')}};

        const skip: number = Number((pageNumber - 1) * pageSize);

        return await this.userRepository.getAllUsers(sortBy, sortDirection, skip, pageSize, searchLoginTerm, searchEmailTerm);
    }

    public async create(login: string, password: string, email: string): Promise<IUser> {
        const hashPassword = await bcrypt.hash(password, 5);

        return await this.userRepository.createUser(login, hashPassword, email)
    }

    public async delete(id: RefType): Promise<IUser> {
        const deleteUser = await this.userRepository.deleteUser(id);
        if (deleteUser) return deleteUser;
        throw new Error();
    }

    public async testingDelete(): Promise<void> {
        await this.userRepository.deleteAll();
    }

    public async verifyUser(login: string, password: string, email: string): Promise<boolean> {
        const consideredUser = await this.userRepository.findUser(login, email);
        if(!consideredUser) {
            throw new Error();
        }
        const consideredHashPassword = await bcrypt.hash(password, 5);
        if(consideredUser.password === consideredHashPassword) return true;

        throw new Error();
    }
}