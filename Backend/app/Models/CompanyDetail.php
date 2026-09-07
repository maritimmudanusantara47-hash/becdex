<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CompanyDetail extends Model
{
    use HasFactory;
    protected $fillable = [
        'user_id', 'company_phone', 'company_country', 'company_field_id',
        'pic_name', 'pic_position', 'pic_email', 'pic_phone',
        'becdex_category_id', 'description', 'address', 'website', 'brand_name',
    ];
    public function user(): BelongsTo { return $this->belongsTo(User::class); }
    public function companyField(): BelongsTo { return $this->belongsTo(CompanyField::class, 'company_field_id'); }
    public function becdexCategory(): BelongsTo { return $this->belongsTo(BecdexCategory::class, 'becdex_category_id'); }
}
