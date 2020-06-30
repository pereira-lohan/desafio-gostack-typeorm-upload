import { getCustomRepository, getRepository } from 'typeorm';

import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import AppError from '../errors/AppError';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category_title: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category_title,
  }: Request): Promise<Transaction> {
    const categoryRepository = getRepository(Category);
    const transactionRepositoy = getCustomRepository(TransactionsRepository);
    const { total } = await transactionRepositoy.getBalance();

    if (type === 'outcome' && value > total) {
      throw new AppError('The outcome is greater than the balance');
    }

    let category = await categoryRepository.findOne({
      where: { title: category_title },
    });

    if (!category) {
      category = categoryRepository.create({ title: category_title });
      await categoryRepository.save(category);
    }

    const transaction = transactionRepositoy.create({
      title,
      value,
      type,
      category,
    });

    await transactionRepositoy.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
