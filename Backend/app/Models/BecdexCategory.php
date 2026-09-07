<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class BecdexCategory extends Model
{
    protected $fillable = ['name', 'max_score', 'color'];
}
